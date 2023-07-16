<template>
    <div class="sandbox-view"></div>
</template>

<script>
import _ from "lodash"
import * as THREE from "three"
import threeDView from "@/services/3d-view.js"


export default {
    props: ["cameraFocalLength", "datamodel"],
    data() {
        return {
            scene: false,
            container: {
                width: 256,
                height: 256,
            },
            renderer: null,
            scene: null
        }
    },
    watch: {
        datamodel: {
            handler(val, oldVal) {
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
            },
            deep: true
        },
        cameraFocalLength: {
            handler(val) {
                this.camera.setFocalLength(val)
            }
        }
    },

    mounted() {
        this.container.width = this.$el.clientWidth
        this.container.height = this.$el.clientWidth

        var o = threeDView.init({orbitControls: true})
        this.scene      = o.scene
        this.renderer   = o.renderer
        this.camera     = o.camera
        this.$emit("camera", this.camera)

        this.$el.append( this.renderer.domElement )
        window.addEventListener("resize", this.updateCanvasSize)
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
            this.container.width = this.$el.clientWidth
            this.container.height = this.$el.clientWidth

            this.renderer.setSize( this.container.width, this.container.height)
            this.camera.bottom = -this.container.height/this.scale
            this.camera.top = this.container.height/this.scale
            this.camera.left = -this.container.width/this.scale
            this.camera.right = this.container.width/this.scale

            this.camera.updateProjectionMatrix()
        },
    }

}
</script>

<style lang="scss" >

.sandbox-view {
    display: block;
    width: 100%;
    min-width: 320px;
    color: #333;
    font-size: 8px;
    canvas {
        max-width: 100%;
        max-height: 100%;
        aspect-ratio: 1/1;
        width: auto !important;
        height: auto !important;
    }
}
</style>