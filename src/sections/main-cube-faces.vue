<template>
    <div class="cube-faces-container" ref="container">
        <vpg-svg-editable class="svg-container" :updatePattern="phygital.changed" :vpg-pattern="phygital.surfaces[selectedSurface]" v-if="phygital.surfaces[selectedSurface]" @update:vpgPattern="updateVpgPattern" />
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import Phygital from "@/stores/phygital"
import vpgSvgEditable from "@/components/vpg-svg-editable.vue"
import _ from "lodash"
import gsap from "gsap"


export default defineComponent({
    name: "cube-faces",
    components: {
        vpgSvgEditable
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
            
            if (line.length < 2) {
                console.error("Line must have at least 2 coordinates")
                return
            }

            let surface = this.phygital.surfaces[this.selectedSurface]
            
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
                    if (_.isEqual(polyline, line) || _.isEqual(polyline, [line[1], line[0]])) {
                        const removableLine = document.querySelector(".__isRemovable")
                        if (removableLine) {
                            gsap.killTweensOf(removableLine)
                            gsap.to(removableLine, {opacity: 0, duration: 0.5, onComplete: () => {
                                removableLine.remove()
                            }})
                        }
                        return true
                    }
                    return false
                })
            }
            this.phygital.changed ++
            this.phygital.update3DSurface(this.selectedSurface)
        }
    }
})
</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";
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
