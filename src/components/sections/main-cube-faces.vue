<template>
    <div class="cube-faces-container" ref="container">
        
        <div class="cube-faces-svg-container">
            <div class="cube-faces-svg-wrapper">

                <div class="cube-faces-dimensions __isWidth">
                    <span 
                        class="cube-faces-dimensions-button"
                        @click="updateDimension($event,'width', '-')"
                        :class="{'__isDisabled': width <= 2}">
                        <icon type="chevronLeft" />
                    </span>
                    <span class="cube-faces-dimensions-value">{{width}}</span>
                    <span 
                        class="cube-faces-dimensions-button" 
                        @click="updateDimension($event,'width', '+')"
                        :class="{'__isDisabled': width >= 16}">
                        <icon type="chevronRight" />
                    </span>
                </div>
                <div class="cube-faces-dimensions __isHeight">
                    <span 
                        class="cube-faces-dimensions-button"
                        @click="updateDimension($event,'height', '+')"
                        :class="{'__isDisabled': height >= 16}">
                        <icon type="chevronUp" />
                    </span>
                    <span class="cube-faces-dimensions-value">{{height}}</span>
                    <span 
                        class="cube-faces-dimensions-button" 
                        @click="updateDimension($event, 'height', '-')"
                        :class="{'__isDisabled': height <= 2}">
                        <icon type="chevronDown" style="translate: 0 -2px;" />
                    </span>
                </div>
                <vpg-svg :vpg-pattern="phygital.surfaces[selectedSurface]" v-if="phygital.surfaces[selectedSurface]"/>
            </div>
        </div>

        <div class="cube-face-selection-container">
            <select v-model="selectedSurface" class="cube-faces-selectbox">
                <option v-for="(surface, i) in surfaces" :value="surface" :key="i">{{surface}}</option>
            </select>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import Phygital from "@/stores/phygital"
import vpgSvg from "@/components/vpg-svg.vue"
import Icon from "@/components/icon.vue"
import gsap from "gsap"


export default defineComponent({
    name: "cube-faces",
    components: {
        vpgSvg, Icon
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
            selectedSurface: "top",
            surfaces: ["top", "bottom", "left", "right", "front", "back"],
            clickTimeout: 0
        }
    },
    computed: {
        line() {
            return this.character.repeat(512)
        },
        height() {
            return this.phygital.surfaces[this.selectedSurface].height
        },
        width() {
            return this.phygital.surfaces[this.selectedSurface].width
        },
        
    },
    watch: {
        "phygital.selectedSurface"() {
            this.selectedSurface = this.phygital.selectedSurface
        }
    },
    methods: {
        updateDimension(event: MouseEvent, dimension: string, operator: string) {
            let oppositeSurface = ""
            let side1 = {surface: "", dimension: ""}
            let side2 = {surface: "", dimension: ""}

            // First define opposite surface
            if (this.selectedSurface == "top") {
                oppositeSurface = "bottom"
            } else if (this.selectedSurface == "bottom") {
                oppositeSurface = "top"
            } else if (this.selectedSurface == "left") {
                oppositeSurface = "right"
            } else if (this.selectedSurface == "right") {
                oppositeSurface = "left"
            } else if (this.selectedSurface == "front") {
                oppositeSurface = "back"
            } else if (this.selectedSurface == "back") {
                oppositeSurface = "front"
            }

            // Than define side surfaces
            if (this.selectedSurface == "top" || this.selectedSurface == "bottom") {
                if (dimension == "height") {
                    side1.surface = "left"
                    side1.dimension = "width"
                    side2.surface = "right"
                    side2.dimension = "width"
                } else {
                    side1.surface = "front"
                    side1.dimension = "width"
                    side2.surface = "back"
                    side2.dimension = "width"
                }
            } else if (this.selectedSurface == "left" || this.selectedSurface == "right") {
                if (dimension == "height") {
                    side1.surface = "front"
                    side1.dimension = "height"
                    side2.surface = "back"
                    side2.dimension = "height"
                } else {
                    side1.surface = "top"
                    side1.dimension = "height"
                    side2.surface = "bottom"
                    side2.dimension = "height"
                }
            } else if (this.selectedSurface == "front" || this.selectedSurface == "back") {
                if (dimension == "height") {
                    side1.surface = "left"
                    side1.dimension = "height"
                    side2.surface = "right"
                    side2.dimension = "height"
                } else {
                    side1.surface = "top"
                    side1.dimension = "width"
                    side2.surface = "bottom"
                    side2.dimension = "width"
                }
            } 

            if (operator === "+") {
                this.phygital.surfaces[this.selectedSurface][dimension]++
                this.phygital.surfaces[oppositeSurface][dimension]     = this.phygital.surfaces[this.selectedSurface][dimension]
                this.phygital.surfaces[side1.surface][side1.dimension] = this.phygital.surfaces[this.selectedSurface][dimension]
                this.phygital.surfaces[side2.surface][side2.dimension] = this.phygital.surfaces[this.selectedSurface][dimension]
            } else {
                this.phygital.surfaces[this.selectedSurface][dimension]--
                this.phygital.surfaces[oppositeSurface][dimension]     = this.phygital.surfaces[this.selectedSurface][dimension]
                this.phygital.surfaces[side1.surface][side1.dimension] = this.phygital.surfaces[this.selectedSurface][dimension]
                this.phygital.surfaces[side2.surface][side2.dimension] = this.phygital.surfaces[this.selectedSurface][dimension]
            }
            clearTimeout(this.clickTimeout)
            
            
            
            this.clickTimeout = setTimeout(() => {
                this.phygital.updateSurfaces()
                this.phygital.update3DSurface(this.selectedSurface)
                this.phygital.update3DSurface(oppositeSurface)
            }, 200)


            const currentTarget = event.currentTarget
            const direction = operator === "+" ? -1 : 1
            gsap.timeline()
                .to(currentTarget, {
                    scale: 1.1,
                    y: dimension === "height" ? 16 * direction : 0,
                    x: dimension === "width" ? 16 * direction : 0,
                    duration: .16,
                    ease: "power1.inOut"
                })
                .to(currentTarget, {
                    scale: 1,
                    y: 0,
                    x: 0,
                    duration: 0.12,
                    ease: "elastic.out(1, 0.3)"
                })
        },
    }
})
</script>

<style lang="scss">
@import "./../../assets/scss/variables.scss";
.cube-faces-container {
    display: flex;
    flex-flow: column;
    width: 100%;
    height: 100%;
    justify-items: center;
    align-items: center;
    position: relative;
    

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

.cube-faces-svg-wrapper {
    position: absolute;
    max-width: 100%;
    max-height: 100%;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.cube-face-selection-container {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #222;
    color: #eee;
    padding: 0;
    font-family: $defaultFont;
    display: none;
}

.cube-faces-selectbox {
    border: 0 none transparent;
    background-color: transparent;
    color: currentColor;
    font-family: $defaultFont;
    padding: 8px 16px;
    font-style: italic;
    &:focus {
        border: 0 none transparent;
        outline: 0 none transparent;
    }
}

.cube-faces-svg-container {
    position: relative;
    margin: 0;
    height: calc(100% - 0px);
    width: calc(100% - 0px);
}

.cube-faces-dimensions {
    opacity: 0;
    pointer-events: none;
    position: absolute;
    text-align: center;
    position: absolute;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;

    &.__isWidth {
        top: -104px;
        width: 100%;
        
        .cube-faces-dimensions-value {
            width: auto;
            padding-left: 16px;
            padding-right: 16px;
        }
    }
    &.__isHeight {
        right: -80px;
        height: 100%;
        flex-flow: column;
        .cube-faces-dimensions-value {
            width: 48px;
            padding: 0;
        }
    }
}


.cube-faces-dimensions-button {
    cursor: pointer;
    height: 48px;
    width: 48px;
    line-height: 48px;
    transition: .32s ease all;
    display: flex;
    &.__isDisabled {
        pointer-events: none;
        opacity: 0;
    }
}

.cube-faces-dimensions-value {
    font-family: $accentFont;
    font-size: 32px;
    font-weight: normal;
    height: 48px;
    line-height: 48px;
    text-align: center;
    display: inline-block;
}

@media all and (orientation: landscape) {
    .cube-faces-container.__isActive {
        .cube-face-selection-container  {
            padding-right: 8px;
        }
        .cube-faces-selectbox {
            padding-left: 12px;
        }
    }
}

@media all and (orientation: portrait) {
    .cube-faces-container.__isActive {
        .cube-faces-svg-container {
            // height: calc(100% - 180px);
            // width: 100%;
        }
    }
}

</style>
