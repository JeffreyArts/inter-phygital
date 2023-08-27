<!-- 
use the .ascii-box-content for styling the content inside the box. Best way is to style it via the parent component/route that you put this element in.
 -->

<template>
    <div class="dashboard" ref="container" :data-grid="grid">
        <slot />
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import _ from "lodash"
import gsap from "gsap"

export default defineComponent({
    name: "dashboard-component",
    data: () => {
        return {
            orientation: "portrait" as "portrait" | "landscape",
            activeComponent: "cube-3d" as "cube-3d" | "cube-faces",
            elements: [] as HTMLElement[],
            activeIndex: 0 as null | number,
            activeElement: null as null | HTMLElement,
            cellSize:128,
            grid: "3x8"
        }
    },
    computed: {
        
    },
    watch: {
    
    },
    mounted() {
        this.updateDashboard()
    },
    methods: {
        updateDashboard() {
            const container = this.$refs["container"] as HTMLElement
            if (!container)  return 
            
            container.clientHeight > container.clientWidth ? this.orientation = "portrait" : this.orientation = "landscape"
            this.elements = container.children as unknown as HTMLElement[]
            
            if (this.elements.length <= 1) {
                return
            } 

            const style = window.getComputedStyle(container)
            const width = container.clientWidth
            const height = container.clientHeight
            

            if (_.isNaN(width) || _.isNaN(height)) {
                return
            }

            // Define grid and cell size
            if (this.orientation == "portrait") {
                this.grid = "6x6"
                this.cellSize = Math.floor(width/parseInt(this.grid.split("x")[0], 10))
            } else if (this.orientation == "landscape") {
                this.cellSize = Math.floor(height/parseInt(this.grid.split("x")[1], 10))
            }
            

            // Calculate positions
            const positions = _.map(this.elements, (el, index) => {
                const position = {
                    width:  0,
                    height: 0,
                    left:   0,
                    top:    0,
                    unit: "px",
                    element: el,
                }

                switch (index) {
                case 0:
                    position.top    = this.orientation == "portrait" ? 0 : 0
                    position.left   = this.orientation == "portrait" ? 0 : 0
                    position.width  = this.orientation == "portrait" ? width : width - this.cellSize * parseInt(this.grid.split("x")[0], 10)
                    position.height = this.orientation == "portrait" ? height - this.cellSize * parseInt(this.grid.split("x")[1], 10) : height
                    break
                case 1:
                    position.top    = this.orientation == "portrait" ? height - this.cellSize * parseInt(this.grid.split("x")[1], 10) : 0
                    position.left   = this.orientation == "portrait" ? 0 : width - this.cellSize * parseInt(this.grid.split("x")[0], 10)
                    position.width  = this.orientation == "portrait" ? width : this.cellSize * parseInt(this.grid.split("x")[0], 10)
                    position.height = this.orientation == "portrait" ? this.cellSize * parseInt(this.grid.split("x")[1], 10) : height
                    break
                }
                return position
            })
            

            // Set positions
            _.forEach(positions, (posData) => {
                gsap.set(posData.element, {
                    top:    posData.unit == "px" ? `${posData.top}px`   : `${posData.top}%`,
                    left:   posData.unit == "px" ? `${posData.left}px`  : `${posData.left}%`,
                    width:  posData.unit == "px" ? `${posData.width}px` : `${posData.width}%`,
                    height: posData.unit == "px" ? `${posData.height}px`: `${posData.height}%`,
                })
            })
        }
    }
})
</script>

<style lang="scss">
@import "./../assets/scss/variables.scss";
.dashboard {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
