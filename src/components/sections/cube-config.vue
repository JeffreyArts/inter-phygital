<template>
    <div class="cube-faces-container" ref="container">
        Seed: {{phygital.seed}} <button @click="regenerateSeed">🔄</button>
        Block size: {{ phygital.blockSize }}cm
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import Phygital from "@/stores/phygital"

export default defineComponent({
    name: "cube-faces",
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
        }
    },
    computed: {
        line() {
            return this.character.repeat(512)
        }
    },
    mounted() {
        this.phygital.generateSeed()
    },
    methods: {
        regenerateSeed() {
            this.phygital.generateSeed()
        }
    }
})
</script>

<style lang="scss" scoped>
@import "./../../assets/scss/variables.scss";
.cube-faces-container {
    max-width: 100%;
    max-height: 100%;
    aspect-ratio: 1/1;
}

</style>
