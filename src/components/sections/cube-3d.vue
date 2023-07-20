<template>
    <div class="cube-3d-container" ref="container">
        <sandbox-view v-bind:datamodel="pattern3D" v-bind:camera-focal-length="128" :model-changed="pattern3D.update"></sandbox-view>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import Phygital from "@/stores/phygital"
import * as THREE from "three"
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
        setTimeout(() => {
            this.update3DModel("top")
            this.update3DModel("bottom")
            this.update3DModel("left")
            this.update3DModel("right")
            this.update3DModel("front")
            this.update3DModel("back")
        })
    },
    methods: {
        // regenerateSeed() {
        //     this.phygital.generateSeed()
        // },
        update3DModel(side: "top" | "bottom" | "left" | "right" | "front" | "back"){
            _.remove(this.pattern3D.children, childObject => {
                if (childObject.name == "innerCube") {
                    removeObject(childObject)
                    return true
                }
                if (childObject.name == `face-${side}`) {
                    removeObject(this.cube[side])
                    removeObject(childObject)
                    return true
                }
            })

            this.pattern3D.name = Math.floor(Math.random()*1000)
            this.pattern3D.width = this.phygital.surfaces.top.width
            this.pattern3D.depth = this.phygital.surfaces.top.height
            this.pattern3D.height = this.phygital.surfaces.left.height

            if (!this.phygital.openCube) {
                const box = new THREE.BoxGeometry(this.pattern3D.width-1.5, this.pattern3D.height-1.5, this.pattern3D.depth-1.5)
                const mesh = new THREE.Mesh(box, this.phygital.surfaces.top.model3D.material)
                mesh.name = "innerCube"
                mesh.position.set((this.pattern3D.width-1.5)/2, (this.pattern3D.height-1.5)/2 + 1.25, (this.pattern3D.depth-1.5)/2)
                this.pattern3D.add(mesh)   
            }
            
            this.pattern3D.add(_.cloneDeep(this.phygital.surfaces[side].model3D))
            if (_.isUndefined(this.pattern3D.update)) {
                this.pattern3D.update = 0
            } else {
                this.pattern3D.update ++
            }

            this.phygital.model3D = _.cloneDeep(this.pattern3D)

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
@import "@/assets/scss/variables.scss";
.main {
    .cube-3d-container {
        padding: 0;
        > * {
            pointer-events: visible;
        }
    }
}



.cube-3d-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    height: 100%;
    > * {
        pointer-events: none;
    }
    
        

    .sandbox-view canvas {
        // position: absolute;
        // max-width: calc(100% - 32px);
        // max-height: calc(100% - 32px);
    }

}
</style>
