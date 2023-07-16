<template>
    <div class="cube-3d-container" ref="container">
        <sandbox-view v-bind:datamodel="pattern3D" v-bind:camera-focal-length="128"></sandbox-view>

        <!-- pattern3D:{{ pattern3D }} -->
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import Phygital from "@/stores/phygital"
import * as THREE from "three"
import { CSG } from "three-csg-ts"
import patternToThreejs from "@/services/pattern-to-threejs.js"
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
    mounted() {
        this.phygital.generateSeed()
        this.create3DPattern()
    },
    methods: {
        regenerateSeed() {
            this.phygital.generateSeed()
        },
        create3DPattern(side: "top" | "bottom" | "left" | "right" | "front" | "back"){
            const diameter = .5
            _.forEach(this.phygital.surfaces, (surface, surfaceSide) => {

                _.remove(this.pattern3D.children, childObject => {
                    if (childObject.name == `face-${surfaceSide}`) {
                        removeObject(this.cube[surfaceSide])
                        removeObject(childObject)
                        return true
                    }
                })
                console.log(surface)
                this.pattern3D.add(surface.object)
                // const pattern3D = patternToThreejs(surface.polylines, {
                //     width: surface.width,
                //     height: surface.height,
                //     type: "box",
                //     diameter: diameter,
                //     beamWidth: diameter,
                //     beamHeight: diameter,
                //     tube: false,
                //     color: "#444",
                //     tubeThickness: .0125,
                // })
                
                // let mergedObject = pattern3D[0]
                // for (var i = 1; i < pattern3D.length; i++) {
                //     mergedObject = CSG.toMesh(CSG.fromMesh(mergedObject).union(CSG.fromMesh(pattern3D[i])), mergedObject.matrix)
                // }

                // if (surfaceSide === "top") {
                //     _.remove(this.pattern3D.children, childObject => {
                //         if (childObject.name == "face-top") {
                //             removeObject(this.cube.top)
                //             removeObject(childObject)
                //             return true
                //         }
                //     })
                //     this.cube.top = mergedObject.clone()
                //     this.cube.top.material = pattern3D[0].material
                //     this.cube.top.name = "face-top"
                //     this.cube.bottom.rotateY(Math.PI/180* 90)
                //     this.cube.top.position.y = this.phygital.surfaces.top.height-1
                //     this.cube.top.updateMatrix()
                //     this.pattern3D.add(this.cube.top)
                // }

                // if (surfaceSide === "bottom") {
                //     _.remove(this.pattern3D.children, childObject => {
                //         if (childObject.name == "face-bottom") {
                //             removeObject(this.cube.bottom)
                //             removeObject(childObject)
                //             return true
                //         }
                //     })
                //     this.cube.bottom = mergedObject.clone()
                //     this.cube.bottom.material = pattern3D[0].material
                //     this.cube.bottom.name = "face-bottom"
                //     this.cube.bottom.rotateZ(Math.PI/180* 180)
                //     this.cube.bottom.rotateY(Math.PI/180* 180)
                //     this.cube.bottom.position.z += this.phygital.surfaces.bottom.height-1 
                //     this.cube.bottom.position.y = diameter
                //     this.cube.bottom.updateMatrix()
                //     this.pattern3D.add(this.cube.bottom)
                // }
                
                // this.pattern3D.add(this.cube.bottom)

                // if (surfaceSide === "front") {
                //     _.remove(this.pattern3D.children, childObject => {
                //         if (childObject.name == "face-front") {
                //             removeObject(this.cube.front)
                //             removeObject(childObject)
                //             return true
                //         }
                //     })
                //     this.cube.front = mergedObject.clone()
                //     this.cube.front.material = pattern3D[0].material
                //     this.cube.front.name = "face-front"
                //     this.cube.front.rotateY(Math.PI/180* 180)
                //     this.cube.front.position.x += this.phygital.surfaces.front.width-1
                //     this.cube.front.position.z += diameter/2
                //     this.cube.front.position.y += diameter/2 + this.phygital.surfaces.front.height -1
                //     this.cube.front.rotateX(Math.PI/180* 90)
                //     this.cube.front.updateMatrix()
                //     this.pattern3D.add(this.cube.front)
                // }

                // if (surfaceSide === "back") {
                //     _.remove(this.pattern3D.children, childObject => {
                //         if (childObject.name == "face-back") {
                //             removeObject(this.cube.back)
                //             removeObject(childObject)
                //             return true
                //         }
                //     })
                //     this.cube.back = mergedObject.clone()
                //     this.cube.back.material = pattern3D[0].material
                //     this.cube.back.name = "face-back"
                //     this.cube.back.position.z += this.phygital.surfaces.back.height-1 - diameter/2
                //     this.cube.back.position.y += diameter/2 + this.phygital.surfaces.back.height-1
                //     this.cube.back.rotateX(Math.PI/180* 90)
                //     this.cube.back.updateMatrix()
                //     this.pattern3D.add(this.cube.back)
                // }

                // if (surfaceSide === "left") {
                //     _.remove(this.pattern3D.children, childObject => {
                //         if (childObject.name == "face-left") {
                //             removeObject(this.cube.left)
                //             removeObject(childObject)
                //             return true
                //         }
                //     })
                //     this.cube.left = mergedObject.clone()
                //     this.cube.left.material = pattern3D[0].material
                //     this.cube.left.name = "face-left"
                //     this.cube.left.rotateX(Math.PI/180* 90)
                //     this.cube.left.rotateZ(Math.PI/180* 90)
                //     this.cube.left.position.x += diameter/2
                //     this.cube.left.position.y += diameter/2 + this.phygital.surfaces.left.height-1
                //     this.cube.left.updateMatrix()
                //     this.pattern3D.add(this.cube.left)
                // }

                // if (surfaceSide === "right") {
                //     _.remove(this.pattern3D.children, childObject => {
                //         if (childObject.name == "face-right") {
                //             removeObject(this.cube.right)
                //             removeObject(childObject)
                //             return true
                //         }
                //     })
                //     this.cube.right = mergedObject.clone()
                //     this.cube.right.material = pattern3D[0].material
                //     this.cube.right.name = "face-right"
                //     this.cube.right.rotateY(Math.PI/180* 180)
                //     this.cube.right.position.x += this.phygital.surfaces.right.width-1 - diameter/2
                //     this.cube.right.position.y += this.phygital.surfaces.right.height-1 + diameter/2 
                //     this.cube.right.position.z += this.phygital.surfaces.right.height-1

                //     this.cube.right.rotateX(Math.PI/180* 90)
                //     this.cube.right.rotateZ(Math.PI/180* 90)
                //     this.cube.right.updateMatrix()
                //     this.pattern3D.add(this.cube.right)
                // }
            })
        }
    },
})
</script>

<style lang="scss" scoped>
@import "./../../assets/scss/variables.scss";
.cube-3d-container {
    sandbox-view {
        width: 100%;
        height: 100%;
    }
}

</style>
