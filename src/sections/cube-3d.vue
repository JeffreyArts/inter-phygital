<template>
    <div class="cube-3d-container" :class="[mouseDown ? '__mouseDown' : '']" ref="container">
        <sandbox-view :name="name" v-bind:datamodel="pattern3D" :model-changed="updatePattern" @active:camera="cameraUpdate" @mousedown="mouseDown = true" @mouseup="mouseDown = false"></sandbox-view>
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
        name: {
            type: String,
            required: false
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
            pattern3D: new THREE.Object3D(),
            mouseDown: false,
            updatePattern: 0,
            updateTimeout: 0,
            cube: {
                top: new THREE.Object3D(),
                bottom: new THREE.Object3D(),
                left: new THREE.Object3D(),
                right: new THREE.Object3D(),
                front: new THREE.Object3D(),
                back: new THREE.Object3D(),
            },
            // name: "",
            camera: null as THREE.PerspectiveCamera | null,
        }
    },
    computed: {
        line() {
            return this.character.repeat(512)
        }
    },
    watch: {
        "phygital.surfaces.top.update3D":       { handler() { this.update3DModel("top") }, immediate: true },
        "phygital.surfaces.bottom.update3D":    { handler() { this.update3DModel("bottom")}, immediate: true },
        "phygital.surfaces.left.update3D":      { handler() { this.update3DModel("left") }, immediate: true },
        "phygital.surfaces.right.update3D":     { handler() { this.update3DModel("right") }, immediate: true },
        "phygital.surfaces.front.update3D":     { handler() { this.update3DModel("front") }, immediate: true },
        "phygital.surfaces.back.update3D":      { handler() { this.update3DModel("back") }, immediate: true },
    },
    methods: {
        cameraUpdate(camera : THREE.PerspectiveCamera) {
            this.camera = camera
            this.camera.position.set(20, 8, -2)
            this.camera.zoom = 1.5
            this.camera.updateProjectionMatrix()
        },
        update3DModel(side: "top" | "bottom" | "left" | "right" | "front" | "back"){
            clearTimeout(this.updateTimeout)
            _.remove(this.pattern3D.children, childObject => {
                if (childObject.name == "innerCube") {
                    removeObject(childObject)
                    return true
                }
                if (childObject.name.startsWith(`face-${side}`)) {
                    removeObject(this.cube[side])
                    removeObject(childObject)
                    return true
                }
            })

            if (!this.phygital.surfaces[side].model3D) {
                return
            }

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
            
            this.pattern3D.add(this.phygital.surfaces[side].model3D.clone())
            this.updateTimeout = setTimeout(() => {
                this.updatePattern ++
            }, 100)
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
    }
}



.cube-3d-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    .sandbox-view {
        cursor: grab;
    }
    &.__mouseDown {
        .sandbox-view {
            cursor: grabbing;
        }
    }

}
</style>
