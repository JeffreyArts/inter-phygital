<template>
    <div class="sandbox-view" @mousedown="cancelAnimations"></div>
</template>

<script>
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
            scene: false,
            container: {
                width: 256,
                height: 256,
            },
            scale: 6,
            renderer: null,
            camera: null,
            orbitControls: null,
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
        this.container.width = this.$el.clientWidth
        this.container.height = this.$el.clientWidth

        var o = threeDView.init({orbitControls: true})
        // Update the controls target to the origin point
        this.scene      = o.scene
        this.renderer   = o.renderer
        this.camera     = o.camera
        this.orbitControls = o.orbitControls
        this.$emit("active:camera", this.camera)

        
        setTimeout(() => {
            if (this.name) {
                this.phygital.sandbox[this.name] = o
            }
        })
        this.$el.append( this.renderer.domElement )
        window.addEventListener("resize", this.updateCanvasSize)
        setTimeout(() => {
            window.dispatchEvent(new Event("resize"))
        })
    },
    methods: {
        removeObject(object) {
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

            this.scene.remove(object)
        },
        updateCanvasSize() {
            let size = this.$el.clientWidth
            if (size < this.$el.clientHeight) {
                size = this.$el.clientHeight
            }
            this.container.width = size
            this.container.height = size

            this.renderer.setSize( this.container.width, this.container.height)
        },
        updateModel() {
            if (this.datamodel.children.length <= 0){
                return // Can not update model if there is no model
            }


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
                x: this.datamodel.width * 4,
                y: this.datamodel.height * 1.8,
                z: this.datamodel.depth * 4,
                // ease: "power1.in"
                ease: "elastic.out(1, 0.3)"
            })

            gsap.to(this.camera.lookAt, {
                duration: 1.28,
                x: target.x,
                y: target.y,
                z: target.z,
                onUpdate: () => {
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