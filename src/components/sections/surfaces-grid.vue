<template>
    <div class="cube-surfaces-container" ref="container">
        <header class="cube-surfaces-header">
            <span class="cube-surfaces-cell">
                <aztech-label class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'top') && dashboard.activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'top' ? '__isHover': ''
                    ]">
                    top
                </aztech-label>
            </span>
            <span class="cube-surfaces-cell">
                <aztech-label class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'front') && dashboard.activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'front' ? '__isHover': ''
                    ]">
                    front
                </aztech-label>
            </span>
            <span class="cube-surfaces-cell">
                <aztech-label class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'left') && dashboard.activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'left' ? '__isHover': ''
                    ]">
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
                <aztech-label class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'bottom') && dashboard.activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'bottom' ? '__isHover': ''
                    ]">
                    bottom
                </aztech-label>
            </span>
            <span class="cube-surfaces-cell">
                <aztech-label class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'back') && dashboard.activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'back' ? '__isHover': ''
                    ]">
                    back
                </aztech-label>
            </span>
            <span class="cube-surfaces-cell">
                <aztech-label class="cube-surfaces-label" :class="[
                    (phygital.selectedSurface == 'right') && dashboard.activeComponent == 'cube-faces' ? '__isSelected' : '',
                    surface == 'right' ? '__isHover': ''
                    ]">
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
import Dashboard from "@/stores/dashboard"
import AztechGridCell from "@/components/aztech/grid-cell.vue"
import AztechLabel from "@/components/aztech/label.vue"
import VpgSvg from "@/components/vpg-svg.vue"
import gsap from "gsap"

export default defineComponent({
    name: "pgygital-surfaces-grid",
    components: {
        AztechGridCell, VpgSvg, AztechLabel
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
    padding: 0 8px;
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
    &.aztech-label {
        color: $black;
        transition: .24s linear;
        .aztech-label-svg {
            transition: .24s linear;
            fill: transparent;
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
