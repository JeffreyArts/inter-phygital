<template>
    <div class="sandbox-view"></div>
</template>

<script>
import _ from "lodash"
import * as THREE from "three"
import threeDView from "@/services/3d-view.js"


export default {
    props: ["cameraFocalLength", "datamodel", "modelChanged"],
    data() {
        return {
            scene: false,
            container: {
                width: 256,
                height: 256,
            },
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
        }
        // cameraFocalLength: {
        //     handler(val) {
        //         this.camera.setFocalLength(val)
        //     }
        // }
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

        this.$emit("camera", this.camera)

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
            this.camera.bottom = -this.container.height/this.scale
            this.camera.top = this.container.height/this.scale
            this.camera.left = -this.container.width/this.scale
            this.camera.right = this.container.width/this.scale

            this.camera.updateProjectionMatrix()
        },
        updateModel() {
            _.each(this.scene.children, childObject => {
                if (childObject.datamodel == true) {
                    this.removeObject(childObject)
                }
            })

            if (this.datamodel && this.datamodel.uuid) {
                var internalDatamodel = this.datamodel.clone()
                internalDatamodel.datamodel = true
                this.scene.add(internalDatamodel)
            }
            
            this.camera.position.set( this.datamodel.width*4, this.datamodel.height*1.72, this.datamodel.depth*4)
            const target = new THREE.Vector3(this.datamodel.width/2-.75, this.datamodel.height/2 + .5, this.datamodel.depth/2-.75)
            this.camera.lookAt( target)
            if (this.orbitControls) {
                this.orbitControls.target =  target
            }
        }
    }

}
</script>

<style lang="scss" >

.sandbox-view {
    width: 100%;
    height: 100%;
    color: #333;
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