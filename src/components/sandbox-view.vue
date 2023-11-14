<template>
    <div class="sandbox-view" @mousedown="cancelAnimations"></div>
</template>

<script lang="ts">
import _ from "lodash"
import * as THREE from "three"
import gsap from "gsap" 
import Phygital from "@/stores/phygital"
import threeDView from "@/services/3d-view.js"


export default {
    props: ["datamodel", "modelChanged", "name"],
    setup() {
        const phygital = Phygital()
        
        return {
            phygital
        }
    },
    data() {
        return {
            scene: null as null | THREE.Scene,
            container: {
                width: 256,
                height: 256,
            },
            scale: 6,
            renderer: null as null | THREE.WebGLRenderer,
            camera: null as null | THREE.PerspectiveCamera,
            orbitControls: null as any,
        }
    },
    watch: {
        "modelChanged": {
            handler(val, oldVal) {
                this.updateModel()
            },
        },
    },
    mounted() {
        this.container.width = this.$el.parentElement.clientWidth
        this.container.height = this.$el.parentElement.clientWidth

        var o = threeDView.init({orbitControls: true})
        // Update the controls target to the origin point
        this.scene      = o.scene
        this.renderer   = o.renderer
        this.camera     = o.camera
        this.orbitControls = o.orbitControls
        this.$emit("active:camera", this.camera)

        
        if (this.name) {
            this.phygital.sandbox[this.name] = o
        }
        if (this.renderer) {
            this.$el.append( this.renderer.domElement )
        }
        window.addEventListener("resize", this.updateCanvasSize)
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.updateCanvasSize)
    },
    methods: {
        removeObject(object: any) {
            if (object.children.length > 0) {
                _.each(object.children, childObject => {
                    this.removeObject(childObject)
                })
            }

            if (object.geometry && object.geometry.dispose) {
                object.geometry.dispose()
            }

            if (object.dispose) {
                object.dispose()
            }
            if (this.scene) {
                this.scene.remove(object)
            }
        },
        updateCanvasSize() {
            const el = this.$el.parentElement
            
            let size = el.clientWidth
            if (size < el.clientHeight) {
                size = el.clientHeight
            }
            this.container.width = size
            this.container.height = size

            if (this.renderer) {
                this.renderer.setSize( this.container.width, this.container.height)
            }
        },
        updateModel() {
            if (this.datamodel.children.length <= 0){
                return // Can not update model if there is no model
            }

            if (!this.camera) return
            if (!this.scene) return

            this.updateCanvasSize()


            _.each(this.scene.children, childObject => {
                if (childObject.name == "datamodel") {
                    this.removeObject(childObject)
                }
            })

            if (this.datamodel && this.datamodel.uuid) {
                const internalDatamodel = this.datamodel.clone()
                internalDatamodel.name = "datamodel"
                this.scene.add(internalDatamodel)
            }

            // Calculate the target position
            const target = new THREE.Vector3(this.datamodel.width / 2 - 0.75, this.datamodel.height / 2 + 0.5, this.datamodel.depth / 2 - 0.75)

            // Animate camera position and lookAt using GSAP
            gsap.to(this.camera.position, {
                duration: 1.28, // Duration in seconds
                x: this.datamodel.width * 2.8,
                y: this.datamodel.height * 1.6,
                z: this.datamodel.height * 2.8,
                ease: "power1.inOut",
            })
            this.camera.lookAt(target.x, target.y, target.z)

            // Animate orientation point of camera
            gsap.to(this.camera.lookAt, {
                duration: 1.28,
                x: target.x,
                y: target.y,
                z: target.z,
                onUpdate: () => {
                    if (!this.camera) return

                    this.camera.lookAt(target)
                    if (this.orbitControls) {
                        this.orbitControls.target = target
                    }
                },
                ease: "power1.inOut",
            })
            
            if (this.orbitControls) {
                this.orbitControls.target =  target
            }
        },
        cancelAnimations() {
            if (!this.camera) return
            gsap.killTweensOf(this.camera.position)
            gsap.killTweensOf(this.camera.lookAt)
        }
    }

}
</script>

<style lang="scss" >
@import "@/assets/scss/variables.scss";
.sandbox-view {
    width: 100%;
    height: 100%;
    color: $black;
    font-size: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    max-height: 100%;
    max-width: 100%;
    position: relative;

    canvas {
        max-width: 100%;
        max-height: 100%;
        aspect-ratio: 1/1;
        width: auto !important;
        height: auto !important;
    }
}
</style>