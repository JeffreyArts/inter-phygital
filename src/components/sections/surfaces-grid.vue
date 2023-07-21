<template>
    <div class="cube-surfaces-container" ref="container">
        <header class="cube-surfaces-header">
            <span class="cube-surfaces-cell">
                <span class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'top') && dashboard.activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'top' ? '__isHover': ''
                    ]">
                    top
                </span>
            </span>
            <span class="cube-surfaces-cell">
                <span class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'front') && dashboard.activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'front' ? '__isHover': ''
                    ]">
                    front
                </span>
            </span>
            <span class="cube-surfaces-cell">
                <span class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'left') && dashboard.activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'left' ? '__isHover': ''
                    ]">
                    left
                </span>
            </span>
        </header>
        <section class="cube-surfaces-grid">
            <AztechGridCell 
                v-for="(s,k) in surfaces" 
                :key="k" 
                class="cube-surfaces-cell"
                :class="[
                    (phygital.selectedSurface == s) && dashboard.activeComponent == 'cube-faces' ? '__isSelected' : '',
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
                <span class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'bottom') && dashboard.activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'bottom' ? '__isHover': ''
                    ]">
                    bottom
                </span>
            </span>
            <span class="cube-surfaces-cell">
                <span class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'back') && dashboard.activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'back' ? '__isHover': ''
                    ]">
                    back
                </span>
            </span>
            <span class="cube-surfaces-cell">
                <span class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'right') && dashboard.activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'right' ? '__isHover': ''
                    ]">
                    right
                </span>
            </span>
        </footer>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
// import icon from "@/components/icon.vue"
import Phygital from "@/stores/phygital"
import Dashboard from "@/stores/dashboard"
import AztechGridCell from "@/components/aztech/grid-cell.vue"
import VpgSvg from "@/components/vpg-svg.vue"
import gsap from "gsap"

export default defineComponent({
    name: "pgygital-surfaces-grid",
    components: {
        AztechGridCell, VpgSvg
    },
    setup() {
        const phygital = Phygital()
        const dashboard = Dashboard()
        return {
            phygital, dashboard
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
            this.dashboard.activeComponent = "cube-faces"
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
    grid-template-columns: repeat(3, 1fr);
    text-align: center;
}
.cube-surfaces-container {
    padding: 0 16px;
    width: 100%;
}
.cube-surfaces-footer {
    padding-top: 16px;
}
.cube-surfaces-header {
    padding-bottom: 16px;
}

.cube-surfaces-grid {
    .cube-surfaces-cell {
        padding: 8px;
        opacity: 0.9;
        transition: .24s ease all;
        &.__isSelected {
            background-color: #fff;
            opacity:1;
        }
        &.__isHover {
            cursor: pointer;
            opacity:1;
            background-color: #fff;
        }
    }

    .vpg-svg {
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
.cube-surfaces-label {
    display: inline-block;
    position: relative;
    height: 18px;
    line-height: 17px;
    font-weight: normal;
    font-size:14px;
    padding-left: 4px;
    padding-right: 4px;
    transition: .24s linear;
    color: #333;

    // &.__isHover {
    //     background-color: #ddd;
    //     &:after {
    //         opacity: 1;
    //         border-left-color: #ddd;
    //     }
    //    
    //     &:before {
    //         opacity: 1;
    //         border-right-color: #dedede;
    //     }
    // }

    &.__isSelected {
        color: #fff;
        background-color: #333;
        &:after,
        &:before {
            opacity: 1;
        }
        &:after {
            opacity: 1;
            border-left-color: #333;
        }
        
        &:before {
            opacity: 1;
            border-right-color: #333;
        }
    }

    &:after,
    &:before {
        content: "";
        position: absolute;
        top: 0;
        width: 0;
        height: 0;
        border: 9px solid transparent;
        opacity: 0;
        transition: .24s linear;
    }

    &:after {
        right: -18px;
    }

    &:before {
        left: -18px;
    }
}
</style>
