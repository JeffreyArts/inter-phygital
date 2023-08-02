<template>
    <div class="cube-faces-container" ref="container">
        <vpg-svg-editable class="svg-container" :vpg-pattern="phygital.surfaces[selectedSurface]" v-if="phygital.surfaces[selectedSurface]" @update:vpgPattern="updateVpgPattern"/>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import Phygital from "@/stores/phygital"
import AztechGridCell from "@/components/aztech/grid-cell.vue"
import AztechLabel from "@/components/aztech/label.vue"
import vpgSvgEditable from "@/components/vpg-svg-editable.vue"
import Icon from "@/components/icon.vue"
import _ from "lodash"
import gsap from "gsap"


export default defineComponent({
    name: "cube-faces",
    components: {
        vpgSvgEditable, Icon, AztechGridCell, AztechLabel
    },
    props: {
        character: {
            type: String,
            required: false,
            default: "-"
        },
    },
    setup() {
        const phygital = Phygital()
        
        return {
            phygital
        }
    },
    data: () => {
        return {
            selectedSurface: "top" as "top" | "bottom" | "left" | "right" | "front" | "back",
            surfaces: ["top", "bottom", "left", "right", "front", "back"],
            clickTimeout: 0
        }
    },
    watch: {
        "phygital.selectedSurface"() {
            this.selectedSurface = this.phygital.selectedSurface
            // setTimeout(() => {
            //     window.dispatchEvent(new Event("resize"))
            // })
        }
    },
    mounted() {
        this.selectedSurface = this.phygital.selectedSurface
    },
    methods: {
        updateVpgPattern(line:Array<{x: number, y: number}>, action: "add" | "remove" ) {
            if (!this.selectedSurface) {
                return
            }

            let surface = null
            
            if (this.phygital.surfaces) {
                surface = this.phygital.surfaces[this.selectedSurface]
            }
            if (!surface) {
                return
            }
            surface.mirrorX = 0
            surface.mirrorY = 0
            this.phygital.seed = "custom"
            
            if (action == "add") {
                surface.polylines.push(_.clone(line))
            } else {
                _.remove(surface.polylines, (polyline) => {
                    return _.isEqual(polyline, line) || _.isEqual(polyline, line.reverse())
                })
            }
            this.phygital.update3DSurface(this.selectedSurface)
        }
        // updateDimension(event: MouseEvent, dimension: string, operator: string) {
        //     let oppositeSurface = ""
        //     let side1 = {surface: "", dimension: ""}
        //     let side2 = {surface: "", dimension: ""}

        //     // First define opposite surface
        //     if (this.selectedSurface == "top") {
        //         oppositeSurface = "bottom"
        //     } else if (this.selectedSurface == "bottom") {
        //         oppositeSurface = "top"
        //     } else if (this.selectedSurface == "left") {
        //         oppositeSurface = "right"
        //     } else if (this.selectedSurface == "right") {
        //         oppositeSurface = "left"
        //     } else if (this.selectedSurface == "front") {
        //         oppositeSurface = "back"
        //     } else if (this.selectedSurface == "back") {
        //         oppositeSurface = "front"
        //     }

        //     // Than define side surfaces
        //     if (this.selectedSurface == "top" || this.selectedSurface == "bottom") {
        //         if (dimension == "height") {
        //             side1.surface = "left"
        //             side1.dimension = "width"
        //             side2.surface = "right"
        //             side2.dimension = "width"
        //         } else {
        //             side1.surface = "front"
        //             side1.dimension = "width"
        //             side2.surface = "back"
        //             side2.dimension = "width"
        //         }
        //     } else if (this.selectedSurface == "left" || this.selectedSurface == "right") {
        //         if (dimension == "height") {
        //             side1.surface = "front"
        //             side1.dimension = "height"
        //             side2.surface = "back"
        //             side2.dimension = "height"
        //         } else {
        //             side1.surface = "top"
        //             side1.dimension = "height"
        //             side2.surface = "bottom"
        //             side2.dimension = "height"
        //         }
        //     } else if (this.selectedSurface == "front" || this.selectedSurface == "back") {
        //         if (dimension == "height") {
        //             side1.surface = "left"
        //             side1.dimension = "height"
        //             side2.surface = "right"
        //             side2.dimension = "height"
        //         } else {
        //             side1.surface = "top"
        //             side1.dimension = "width"
        //             side2.surface = "bottom"
        //             side2.dimension = "width"
        //         }
        //     } 

        //     if (operator === "+") {
        //         this.phygital.surfaces[this.selectedSurface][dimension]++
        //         this.phygital.surfaces[oppositeSurface][dimension]     = this.phygital.surfaces[this.selectedSurface][dimension]
        //         this.phygital.surfaces[side1.surface][side1.dimension] = this.phygital.surfaces[this.selectedSurface][dimension]
        //         this.phygital.surfaces[side2.surface][side2.dimension] = this.phygital.surfaces[this.selectedSurface][dimension]
        //     } else {
        //         this.phygital.surfaces[this.selectedSurface][dimension]--
        //         this.phygital.surfaces[oppositeSurface][dimension]     = this.phygital.surfaces[this.selectedSurface][dimension]
        //         this.phygital.surfaces[side1.surface][side1.dimension] = this.phygital.surfaces[this.selectedSurface][dimension]
        //         this.phygital.surfaces[side2.surface][side2.dimension] = this.phygital.surfaces[this.selectedSurface][dimension]
        //     }
        //     clearTimeout(this.clickTimeout)
            
            
            
        //     this.clickTimeout = setTimeout(() => {
        //         this.phygital.updateSurfaces()
        //         this.phygital.update3DSurface(this.selectedSurface)
        //         this.phygital.update3DSurface(oppositeSurface)
        //     }, 200)


        //     const currentTarget = event.currentTarget
        //     const direction = operator === "+" ? -1 : 1
        //     gsap.timeline()
        //         .to(currentTarget, {
        //             scale: 1.1,
        //             y: dimension === "height" ? 16 * direction : 0,
        //             x: dimension === "width" ? 16 * direction : 0,
        //             duration: .16,
        //             ease: "power1.inOut"
        //         })
        //         .to(currentTarget, {
        //             scale: 1,
        //             y: 0,
        //             x: 0,
        //             duration: 0.12,
        //             ease: "elastic.out(1, 0.3)"
        //         })
        // },
    }
})
</script>

<style lang="scss">
@import "./../../assets/scss/variables.scss";
.cube-faces-container {
    display: flex;
    width: 100%;
    height: 100%;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    position: relative;
    gap: 16px;
    .aztech-grid-cell-corner {
        scale: 1.32;
    }
    

    .vpg-svg {
        justify-content: center;
        align-items: center;
        display: flex;
        // aspect-ratio: 1/1;
        width: 100%;
        height: 100%;
    }

    // &.__isActive {
    //     .cube-face-selection-container {
    //         display: flex;
    //     }

    //     .cube-faces-dimensions {
    //         opacity: 1;
    //         pointer-events: visible;
    //     }
        
    //     .cube-faces-svg-container {
    //         margin: 120px 120px calc(120px - 48px) 120px;
    //         height: calc(100% - 120px * 2 - 48px);
    //         width: calc(100% - 120px * 2);
    //     }
    //     &:before {
    //         opacity: 0.008;
    //     }
    // }
}


</style>
