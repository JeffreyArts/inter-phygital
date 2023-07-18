<template>
    <div class="cube-3d-container" ref="container">
        <sandbox-view v-bind:datamodel="pattern3D" v-bind:camera-focal-length="128" :model-changed="pattern3D.update"></sandbox-view>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import Phygital from "@/stores/phygital"
import * as THREE from "three"
import { CSG } from "three-csg-ts"
import patternToThreejs from "@/services/pattern-to-threejs.js"
import objectHash from "object-hash"
import SandboxView from "@/components/sandbox-view.vue"
import _ from "lodash"

const removeObject = (object) => {
    if (object.children.length > 0) {
        _.remove(object.children, childObject => {
            return removeObject(childObject)
        })
    }

    if (object.geometry && object.geometry.dispose) {
        object.geometry.dispose()
    }

    if (object.dispose) {
        object.dispose()
    }
    return true
}

export default defineComponent({
    name: "cube-faces",
    components: {
        SandboxView
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
            pattern3D: new THREE.Object3D(),
            cube: {
                top: new THREE.Object3D(),
                bottom: new THREE.Object3D(),
                left: new THREE.Object3D(),
                right: new THREE.Object3D(),
                front: new THREE.Object3D(),
                back: new THREE.Object3D(),
            },
        }
    },
    computed: {
        line() {
            return this.character.repeat(512)
        }
    },
    watch: {
        "phygital.surfaces.top.update3D":       { handler() { this.update3DModel("top") } },
        "phygital.surfaces.bottom.update3D":    { handler() { this.update3DModel("bottom")} },
        "phygital.surfaces.left.update3D":      { handler() { this.update3DModel("left") } },
        "phygital.surfaces.right.update3D":     { handler() { this.update3DModel("right") } },
        "phygital.surfaces.front.update3D":     { handler() { this.update3DModel("front") } },
        "phygital.surfaces.back.update3D":      { handler() { this.update3DModel("back") } },
    },
    mounted() {
        // this.create3DPattern()
    },
    methods: {
        // regenerateSeed() {
        //     this.phygital.generateSeed()
        // },
        update3DModel(side: "top" | "bottom" | "left" | "right" | "front" | "back"){
            _.remove(this.pattern3D.children, childObject => {
                if (childObject.name == `face-${side}`) {
                    removeObject(this.cube[side])
                    removeObject(childObject)
                    return true
                }
            })
            
            this.pattern3D.add(this.phygital.surfaces[side].model3D)
            if (_.isUndefined(this.pattern3D.update)) {
                this.pattern3D.update = 0
            } else {
                this.pattern3D.update ++
            }

            this.pattern3D.width = this.phygital.surfaces.top.width
            this.pattern3D.depth = this.phygital.surfaces.top.height
            this.pattern3D.height = this.phygital.surfaces.left.height
        },
        oppositeSurface(side: "top" | "bottom" | "left" | "right" | "front" | "back") {
            switch (side) {
            case "top":
                return "bottom"
            case "bottom":
                return "top"
            case "left":
                return "right"
            case "right":
                return "left"
            case "front":
                return "back"
            case "back":
                return "front"
            }
        },
        hash (object) {
            return objectHash(object)
        },
    },
})
</script>

<style lang="scss">
@import "./../../assets/scss/variables.scss";
.cube-3d-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    > * {
        pointer-events: none;
    }
    
    &.__isActive {
        padding: 64px;
        > * {
            pointer-events: visible;
        }

        .sandbox-view canvas {
            max-width: calc(100% - 128px);
            max-height: calc(100% - 128px);
        }
    }

    

    .sandbox-view canvas {
        // position: absolute;
        max-width: calc(100% - 32px);
        max-height: calc(100% - 32px);
    }

}
</style>
