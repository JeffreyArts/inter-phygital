<template>
    <div class="cube-surfaces-container" ref="container">
        <header class="cube-surfaces-header">
            <span class="cube-surfaces-cell">
                <aztech-label class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'top') && activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'top' ? '__isHover': ''
                    ]"
                    @click="selectSurface('top')">
                    top
                </aztech-label>
            </span>
            <span class="cube-surfaces-cell">
                <aztech-label class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'front') && activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'front' ? '__isHover': ''
                    ]"
                    @click="selectSurface('front')" >
                    front
                </aztech-label>
            </span>
            <span class="cube-surfaces-cell">
                <aztech-label class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'left') && activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'left' ? '__isHover': ''
                    ]"
                    @click="selectSurface('left')" >
                    left
                </aztech-label>
            </span>
        </header>
        <section class="cube-surfaces-grid">
            <AztechGridCell 
                v-for="(s,k) in surfaces" 
                :key="k" 
                class="cube-surfaces-cell"
                :class="[
                    (phygital.selectedSurface == s) && activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == s && phygital.selectedSurface !== s ? '__isHover' : ''
                ]" 
                @click="selectSurface(s)" 
                @mouseover="hoverSurface(s)" 
                @mouseout="deselectSurface"> 
                <vpg-svg :vpg-pattern="phygital.surfaces[s]"/>
            </AztechGridCell>
        </section>
        <footer class="cube-surfaces-footer">
            <span class="cube-surfaces-cell">
                <aztech-label class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'bottom') && activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'bottom' ? '__isHover': ''
                    ]"
                    @click="selectSurface('bottom')" >
                    bottom
                </aztech-label>
            </span>
            <span class="cube-surfaces-cell">
                <aztech-label class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'back') && activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'back' ? '__isHover': ''
                    ]"
                    @click="selectSurface('back')" >
                    back
                </aztech-label>
            </span>
            <span class="cube-surfaces-cell">
                <aztech-label class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'right') && activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'right' ? '__isHover': ''
                    ]"
                    @click="selectSurface('right')" >
                    right
                </aztech-label>
            </span>
        </footer>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
// import icon from "@/components/icon.vue"
import Phygital from "@/stores/phygital"
import AztechGridCell from "@/components/aztech/grid-cell.vue"
import AztechLabel from "@/components/aztech/label.vue"
import VpgSvg from "@/components/vpg-svg.vue"

export default defineComponent({
    name: "pgygital-surfaces-grid",
    components: {
        AztechGridCell, VpgSvg, AztechLabel
    },
    props: {
        activeComponent: {
            type: String,
            default: ""
        }
    },
    setup() {
        const phygital = Phygital()
        return {
            phygital
        }
    },
    data: () => {
        return {
            surfaces: [
                "top", "front", "left", "bottom", "back", "right"
            ] as Array<"top" | "front" | "left" | "bottom" | "back" | "right">,
            surface: "" as "" | "top" | "front" | "left" | "bottom" | "back" | "right"
        }
    },
    computed: {
        
    },
    methods: {
        selectSurface(surface: "top" | "front" | "left" | "bottom" | "back" | "right") {
            this.phygital.selectedSurface = surface
            // this.activeComponent = "cube-faces"
        },
        
        hoverSurface(surface: "top" | "front" | "left" | "bottom" | "back" | "right") {
            this.surface = surface
        },
        deselectSurface() {
            this.surface = ""
        },
    }
})
</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";
.cube-surfaces-grid,
.cube-surfaces-footer,
.cube-surfaces-header {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, calc(100%/3));
    text-align: center;
}

.cube-surfaces-container {
    padding: 4px 1px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-around;
    align-items: flex-end;
}
.cube-surfaces-header {
    .cube-surfaces-cell {
        @media (orientation: portrait) {
            padding: 4px 0;
        }
    }
}

.cube-surfaces-grid {
    .cube-surfaces-cell {
        padding: 8px;
        transition: .24s ease all;
        &.__isSelected {
            background-color: #fff;
            opacity:1;
            .vpg-svg {
                opacity:1;
                polyline {
                    stroke: $dark-grey;
                }
            }
        }
        &.__isHover {
            cursor: pointer;
            background-color: #f6f6f6;
            .vpg-svg {
                opacity:1;
                polyline {
                    stroke: $dark-grey2;
                }
            }
        }
        .vpg-svg {
            opacity: 0.72;
        }
    }

    .vpg-svg {
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        polyline {
            stroke: $grey;
            transition: .24s ease all;
        }
    }
}
.cube-surfaces-label {
    &.aztech-label {
        color: $black;
        transition: .24s linear;
        font-size: 12px;
        .aztech-label-svg {
            transition: .24s linear;
            fill: transparent;
        }
    }
    
    &.__isHover {
        &.aztech-label {
            color: #fff;
            fill: $dark-grey2;
            .aztech-label-svg {
                fill: $dark-grey;
            }
        }
    }
    &.__isSelected {
        &.aztech-label {
            color: #fff;
            .aztech-label-svg {
                fill: $black;
            }
        }
    }
}
</style>
