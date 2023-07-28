<!-- 
use the .vpg-svg-content for styling the content inside the box. Best way is to style it via the parent component/route that you put this element in.
 -->

 <template>
    <div class="vpg-svg-editable">
        <figure ref="vpgSVG" />
        <svg style="display:none;" id="grid-point-container" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 24" xml:space="preserve">
            <g class="grid-point" id="grid-point">
                <circle  class="center_ring"  cx="12.5" cy="12.5" r="4"/>
                <circle  class="inner-ring"  cx="12.5" cy="12.5" r="8"/>
                <circle  class="outer-ring"  cx="12.5" cy="12.5" r="12"/>
                <line class="line-horizontal" x1="12.5" y1="8.5" x2="12.5" y2="16.5"/>
                <line class="line-vertical" x1="16.5" y1="12.5" x2="8.5" y2="12.5"/>
            </g>
        </svg>
    </div>


</template>


<script lang="ts">
import { defineComponent } from "vue"
import { SVG } from "@svgdotjs/svg.js"
import Phygital from "@/stores/phygital"
import _ from "lodash"


export default defineComponent({
    name: "vpg-svg-editable",
    props: {
        vpgPattern: {
            type: Object,
            required: true,
        },
        // vpgWidth: {
        //     type: Number,
        //     required: true,
        // },
    },
    setup() {
        const phygital = Phygital()
        
        return {
            phygital
        }
    },
    data: () => {
        return {
            svg: SVG(),
            width: 0,
            height: 0,
            scale: 8.5,
            orientation: "portrait" as "portrait" | "landscape",
            observer: null as null | MutationObserver,
            cellSize: 0,
            verticalLines: 0,
            horizontalLines: 0
        }
    },
    watch: {
        "phygital.editMode": {
            handler() {
                this.updateSVG()
            }
        },
        "vpgPattern.polylines": {
            handler() {
                this.width = this.vpgPattern.width
                this.height = this.vpgPattern.height

                const el = this.$el
                if (!el) return
                this.orientation = el.clientWidth > el.clientHeight ? "landscape" : "portrait"
                this.updateSVG()
            },
            deep: true
        }
        
    },
    mounted() {
        this.width = this.vpgPattern.width
        this.height = this.vpgPattern.height

        const el = this.$el
        if (!el) return
        this.orientation = el.clientWidth > el.clientHeight ? "landscape" : "portrait"
        this.updateSVG()
        window.addEventListener("resize", this.updateSVG)
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.updateSVG)
    },
    
    methods: {
        isBetweenCoordinates(coord: {x:number, y:number}, p1: {x:number, y:number}, p2: {x:number, y:number}) {
            return (
                (p1.x <= coord.x && coord.x <= p2.x && p1.y === coord.y) ||
                (p1.x >= coord.x && coord.x >= p2.x && p1.y === coord.y) ||
                (p1.y <= coord.y && coord.y <= p2.y && p1.x === coord.x) ||
                (p1.y >= coord.y && coord.y >= p2.y && p1.x === coord.x)
            )
        },
        updateGrid() {
            if (!this.svg) return
            const gridPointContainer = this.$el.querySelector("#grid-point-container") as SVGElement
            if (!gridPointContainer) return

            
            // Load #outer-ring from svg
            
            const verticalLines = this.verticalLines
            const horizontalLines = this.horizontalLines
            const cellSize = this.cellSize

            const innerRing = SVG(gridPointContainer).findOne("#grid-point .inner-ring") 
            const outerRing = SVG(gridPointContainer).findOne("#grid-point .outer-ring") 
            const centerRing = SVG(gridPointContainer).findOne("#grid-point .center_ring") 
            const lineHorizontal = SVG(gridPointContainer).findOne("#grid-point .line-horizontal")
            const lineVertical = SVG(gridPointContainer).findOne("#grid-point .line-vertical")
            
            if (!innerRing || !outerRing || !centerRing || !lineHorizontal || !lineVertical) return
            for (let i = 0; i < horizontalLines; i++) {
                for (let j = 0; j < verticalLines; j++) {
                    // console.log(i*cellSize, j*cellSize, cellSize)
                    const r1 = innerRing.clone()
                    const r2 = outerRing.clone()
                    const r3 = centerRing.clone()
                    const r4 = lineHorizontal.clone()
                    const r5 = lineVertical.clone()
                    // Create group svg element
                    const gridPoint = this.svg.group().addClass("grid-point")

                    const startPos = {x:1, y:1}
                    if (this.orientation == "landscape") {
                        // if horizontalLines is even
                        startPos.x = Math.floor(this.horizontalLines / 2) - 1
                    } else {
                        startPos.y = Math.floor(this.verticalLines / 2) - 1
                    }
                    
                    const found = _.find(this.vpgPattern.polylines, p => {
                        return _.find(p, (cord, pIndex) => {
                            if (cord.x == i - startPos.x && cord.y == j - startPos.y) {
                                return true
                            }

                            const p1 = {x: i - startPos.x, y: j - startPos.y}
                            const p2 = cord
                            const p3 = p[pIndex+1] ? p[pIndex+1] : p[0]

                            if (this.isBetweenCoordinates(p1,p2,p3)) {
                                return true
                            }
                            return false
                        })
                    })

                    if (found) {
                        gridPoint.addClass("__isActive")
                    }
                
                    r1.attr({
                        id: `grid-point-${i}-${j}`,
                        cx: i*cellSize + cellSize/2,
                        cy: j*cellSize + cellSize/2
                    })
                    r2.attr({
                        id: `grid-point-${i}-${j}`,
                        cx: i*cellSize + cellSize/2,
                        cy: j*cellSize + cellSize/2
                    })
                    r3.attr({
                        id: `grid-point-${i}-${j}`,
                        cx: i*cellSize + cellSize/2,
                        cy: j*cellSize + cellSize/2
                    })
                    r4.attr({
                        id: `grid-point-${i}-${j}`,
                        x1: i*cellSize + cellSize/2 - 4,
                        y1: j*cellSize + cellSize/2,
                        x2: i*cellSize + cellSize/2 + 4,
                        y2: j*cellSize + cellSize/2,
                        style: `transform-origin: ${i*cellSize + cellSize/2}px ${j*cellSize + cellSize/2}px;`
                    })
                    r5.attr({
                        id: `grid-point-${i}-${j}`,
                        x1: i*cellSize + cellSize/2,
                        y1: j*cellSize + cellSize/2 - 4,
                        x2: i*cellSize + cellSize/2 ,
                        y2: j*cellSize + cellSize/2 + 4,
                        style: `transform-origin: ${i*cellSize + cellSize/2}px ${j*cellSize + cellSize/2}px;`
                    })
                    gridPoint.add(r3)
                    gridPoint.add(r2)
                    gridPoint.add(r1)
                    gridPoint.add(r4)
                    gridPoint.add(r5)
                    this.svg.add(gridPoint)
                }
            }

            // this.svg.addTo(gridPoint)
            

        },
        updateSVG() {
            var svgContainer = this.$refs["vpgSVG"] as SVGElement
            this.svg = SVG()
            const el = this.$el as HTMLElement
            if (!el) return
            this.orientation = el.clientWidth > el.clientHeight ? "landscape" : "portrait"
            
            this.svg.viewbox(0,0, el.clientWidth, el.clientHeight)
            // this.svg.viewbox(0,0,this.width + 1, this.height+1) // 1 unit bigger than pattern size to create padding
            
            svgContainer.innerHTML = ""

            if (this.orientation == "landscape") {
                this.verticalLines = this.height + 2
                this.cellSize = this.$el.clientHeight/this.verticalLines
                this.horizontalLines = Math.floor((this.$el.clientWidth ) / this.cellSize)
            } else { 
                this.horizontalLines = this.width + 2
                this.cellSize = this.$el.clientWidth/this.horizontalLines
                this.verticalLines = Math.floor((this.$el.clientHeight ) / this.cellSize)
            }
            
            const startPos = {x:1, y:1}
            if (this.orientation == "landscape") {
                // if horizontalLines is even
                startPos.x = Math.floor(this.horizontalLines / 2) - 1
            } else {
                startPos.y = Math.floor(this.verticalLines / 2) - 1
            }
            
            _.each(this.vpgPattern.polylines, p => {
                var polyline = _.map(p, cord => {
                    // This, plus enlarging viewbox prevents lines to be cut off from edges
                    return `${(startPos.x + cord.x) * this.cellSize + this.cellSize/2},${(startPos.y + cord.y) * this.cellSize + this.cellSize/2}`
                    // return `${cord.x+1},${cord.y+1}`
                }).join(" ")
                

                this.svg.polyline(polyline).attr({
                    fill:"none",
                    class: "vpg-line"
                })
            })

            if (this.phygital.editMode) {
                this.updateGrid()
            }

            this.svg.addTo(svgContainer)
        },
        
    }
})
</script>

<style lang="scss" >
@import "./../assets/scss/variables.scss";
.vpg-svg-editable {
    width: 100%;
    height: 100%;
    
    figure {
        margin: 0;
        display: block;
    }

    svg {
        width: 100%;
        max-width: 100%;
        max-height: 100%;
        display: block;

        .vpg-line {
            stroke-width: 30px;
            stroke-linecap: round;
            z-index: 0;
        }
        .grid-point {
            cursor: pointer;
            z-index: 1;
            &:hover {
                .line-vertical,
                .line-horizontal {
                    scale: 1;
                    opacity: 1;
                }
                .outer-ring {
                    fill: $light-grey;
                    // stroke-width: 0;
                }
            }

            &.__isActive {
                .inner-ring {
                    stroke: $dark-grey2;
                }
                .outer-ring {
                    stroke: $dark-grey;
                    stroke-width: 1px;
                }
            }
        }
        
        polyline {
            stroke: $black;
            stroke-width: .5;
            stroke-type: solid;
            stroke-linecap: square;
        }
        .outer-ring {
            stroke: #e4e5ea;
            stroke-width: 2px;
            fill: transparent;
            transition: .32s all ease;
        }
        .inner-ring {
            stroke: #ced1db;
            stroke-width: 1px;
            stroke-dasharray: 3.2 1.6;
            fill: transparent;
            transition: .32s all ease;
        }

        .line-vertical,
        .line-horizontal {
            opacity: 0;
            stroke-width: 2px;
            transition: .32s all ease;
            stroke: #2d2e33;
            scale: .8;
            stroke-linecap: round;  
        }
        
        .center_ring {
            fill: transparent;
        }
    }
}

</style>
