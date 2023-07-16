<template>
    <div class="cube-faces-container" ref="container">
        
        <div class="cube-faces-svg-container">
            <div class="cube-faces-svg-wrapper">

                <div class="cube-faces-dimensions __isWidth">
                    <span class="cube-faces-dimensions-button" @click="updateDimension('width', '-')">-</span>
                    <span>Width</span>
                    <span class="cube-faces-dimensions-button" @click="updateDimension('width', '+')">+</span>
                </div>
                <div class="cube-faces-dimensions __isHeight">
                    <span class="cube-faces-dimensions-button" @click="updateDimension('height', '-')">-</span>
                    <span>Height</span>
                    <span class="cube-faces-dimensions-button" @click="updateDimension('height', '+')">+</span>
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


export default defineComponent({
    name: "cube-faces",
    components: {
        vpgSvg
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
            surfaces: ["top", "bottom", "left", "right", "front", "back"]
        }
    },
    computed: {
        line() {
            return this.character.repeat(512)
        }
    },
    mounted() {
        
    },
    methods: {
        updateDimension(dimension: string, operator: string) {
            if (operator === "+") {
                this.phygital.surfaces[this.selectedSurface][dimension]++
            } else {
                this.phygital.surfaces[this.selectedSurface][dimension]--
            }
            this.phygital.updateSurfaces()
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

    .vpg-svg {
        justify-content: center;
        align-items: center;
        display: flex;
        // aspect-ratio: 1/1;
        width: 100%;
        height: 100%;
    }

    &.__isActive {
        .cube-face-selection-container {
            display: flex;
        }

        .cube-faces-dimensions {
            opacity: 1;
            pointer-events: visible;
        }
        
        .cube-faces-svg-container {
            margin: 96px;
            height: calc(100% - 192px);
            width: calc(100% - 192px);
        }
    }
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
    margin: 32px;
    height: calc(100% - 64px);
    width: calc(100% - 64px);
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
    gap: 16px;
    z-index: 1;

    &.__isWidth {
        top: -48px;
        width: 100%;
        padding-bottom: 8px;
    }
    &.__isHeight {
        right: -76px;
        height: 100%;
        padding-left: 8px;
        flex-flow: column;
    }
}

.cube-faces-dimensions-button {
    font-size: 24px;
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    background-color: #fff;
    cursor: pointer;
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
