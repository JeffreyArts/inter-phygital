import { defineStore } from "pinia"
import shuffleSeed from "@/services/shuffle-seed"
import { Algorithm } from "visual-pattern-generator"
import _ from "lodash"
import gsap from "gsap"
import { CSG } from "three-csg-ts"
import patternToThreejs from "@/services/pattern-to-threejs.js"

export const phygitalFace = defineStore({
    id: "phygital-face",
    state: () => ({
        surfaces: {
            top: {
                mirrorX: 0,
                mirrorY: 0,
                width: 8,
                height: 8,
                polylines: [],
                object: null as null | THREE.Mesh
            },
            bottom: {
                mirrorX: 0,
                mirrorY: 0,
                width: 8,
                height: 8,
                polylines: [],
                object: null as null | THREE.Mesh
            },
            left: {
                mirrorX: 0,
                mirrorY: 0,
                width: 8,
                height: 8,
                polylines: [],
                object: null as null | THREE.Mesh
            },
            right: {
                mirrorX: 0,
                mirrorY: 0,
                width: 8,
                height: 8,
                polylines: [],
                object: null as null | THREE.Mesh
            },
            front: {
                mirrorX: 0,
                mirrorY: 0,
                width: 8,
                height: 8,
                polylines: [],
                object: null as null | THREE.Mesh
            },
            back: {
                mirrorX: 0,
                mirrorY: 0,
                width: 8,
                height: 8,
                polylines: [],
                object: null as null | THREE.Mesh
            }
        },
        selectedSurface: "top",
        seed: null as null | string,
        blockSize: 1, // in cm
    }),
    actions: {
        generateSeed() {
            this.seed = "A-" +_.random(0, 100000000).toString()
            this.updateSurfaces()
        },
        selectSurface(surface: "top" | "bottom" | "left" | "right" |  "front" | "back") {
            this.selectedSurface = surface
        },
        updateSurfaces() {
            if (!this.seed) {
                return
            }

            const mirroringOptionValues = ["11","00","10","01"] //first digit is boolean for mirrorX, second digit is boolean for mirrorY
            const surfaces = ["top","bottom","left","right", "front", "back"] //first digit is boolean for mirrorX, second digit is boolean for mirrorY
            const vpgBaseOptions = {
                symbols: [
                    {
                        polylines: [
                            [ {x:0, y:0},{ x:1, y:0} ]
                        ],
                        connectCords: [
                            { x:0, y:0 },
                            { x:1, y:0 }
                        ],
                        width:2,
                        height:1
                    },
                    {
                        polylines: [
                            [ {x:0, y:0},{ x:0, y:1} ]
                        ],
                        connectCords: [
                            { x:0, y:0 },
                            { x:0, y:1 }
                        ],
                        width:1,
                        height:2
                    },
                ],
                width: 1,
                height: 1,
                algorithm: {
                    type: "polylines",
                    startPoint: {x:0, y:0},
                    mirrorX: 1,
                    mirrorY: 1,
                    drawConnectLines: true,
                }
            }

            
            const mirroringOptionsArray = _.flatten(Array.from({ length: surfaces.length }, () => mirroringOptionValues))
            mirroringOptionsArray.length = surfaces.length

            const mirroringOptions = shuffleSeed(mirroringOptionsArray, this.seed)
            _.forEach(surfaces, (surface, index) => {
                const mirroringOption = mirroringOptions[index]
                const vpgOptions = _.cloneDeep(vpgBaseOptions)

                let seedOffset = 0 as number
                if (surface === "top" || surface === "bottom") { 
                    seedOffset = 1
                } else if (surface === "left" || surface === "right") {
                    seedOffset = 2
                } else if (surface === "front" || surface === "back") {
                    seedOffset = 3
                }
                    
                vpgOptions.seed = this.seed+"-"+seedOffset
                vpgOptions.width = this.surfaces[surface].width
                vpgOptions.height = this.surfaces[surface].height
                this.surfaces[surface].mirrorX = mirroringOption[0]
                this.surfaces[surface].mirrorY = mirroringOption[1]
                this.surfaces[surface].polylines = Algorithm(vpgOptions).polylines
                this.update3DSurface(surface)
            })

        },
        update3DSurface(surfaceSide: "top" | "bottom" | "left" | "right" |  "front" | "back") {
            const diameter = .5
            const surface = this.surfaces[surfaceSide]
            const pattern3D = patternToThreejs(surface.polylines, {
                width: surface.width,
                height: surface.height,
                type: "box",
                diameter: diameter,
                beamWidth: diameter,
                beamHeight: diameter,
                tube: false,
                color: "#444",
                tubeThickness: .0125,
            })
            
            let mergedObject = pattern3D[0]
            for (let i = 1; i < pattern3D.length; i++) {
                mergedObject = CSG.toMesh(CSG.fromMesh(mergedObject).union(CSG.fromMesh(pattern3D[i])), mergedObject.matrix)
            }

            if (surfaceSide === "top") {
                // _.remove(this.pattern3D.children, childObject => {
                //     if (childObject.name == "face-top") {
                //         removeObject(this.cube.top)
                //         removeObject(childObject)
                //         return true
                //     }
                // })
                mergedObject.material = pattern3D[0].material
                mergedObject.name = "face-top"
                mergedObject.rotateY(Math.PI/180* 90)
                mergedObject.position.y = this.surfaces.top.height-1
                mergedObject.position.z = this.surfaces.top.width-1
                mergedObject.updateMatrix()
                this.surfaces.top.object = mergedObject
            }
            if (surfaceSide === "bottom") {
                mergedObject.material = pattern3D[0].material
                mergedObject.name = "face-bottom"
                mergedObject.rotateZ(Math.PI/180* 180)
                mergedObject.rotateY(Math.PI/180* 180)
                mergedObject.position.z += this.surfaces.bottom.height-1 
                mergedObject.position.y = diameter
                mergedObject.updateMatrix()
                this.surfaces.bottom.object = mergedObject
            }

            if (surfaceSide === "front") {
                mergedObject.material = pattern3D[0].material
                mergedObject.name = "face-front"
                mergedObject.rotateY(Math.PI/180* 180)
                mergedObject.position.x += this.surfaces.front.width-1
                mergedObject.position.z += diameter/2
                mergedObject.position.y += diameter/2 + this.surfaces.front.height -1
                mergedObject.rotateX(Math.PI/180* 90)
                mergedObject.updateMatrix()
                this.surfaces.front.object = mergedObject
            }
            
            if (surfaceSide === "back") {
                mergedObject.material = pattern3D[0].material
                mergedObject.name = "face-back"
                mergedObject.position.z += this.surfaces.back.height-1 - diameter/2
                mergedObject.position.y += diameter/2 + this.surfaces.back.height-1
                mergedObject.rotateX(Math.PI/180* 90)
                mergedObject.updateMatrix()
                this.surfaces.back.object = mergedObject
            }

            if (surfaceSide === "left") {
               
                mergedObject.material = pattern3D[0].material
                mergedObject.name = "face-left"
                mergedObject.rotateX(Math.PI/180* 90)
                mergedObject.rotateZ(Math.PI/180* 90)
                mergedObject.position.x += diameter/2
                mergedObject.position.y += diameter/2 + this.surfaces.left.height-1
                mergedObject.updateMatrix()
                this.surfaces.left.object = mergedObject
            }

            if (surfaceSide === "right") {
                mergedObject.material = pattern3D[0].material
                mergedObject.name = "face-right"
                mergedObject.rotateY(Math.PI/180* 180)
                mergedObject.position.x += this.surfaces.right.width-1 - diameter/2
                mergedObject.position.y += this.surfaces.right.height-1 + diameter/2 
                mergedObject.position.z += this.surfaces.right.height-1

                mergedObject.rotateX(Math.PI/180* 90)
                mergedObject.rotateZ(Math.PI/180* 90)
                mergedObject.updateMatrix()
                this.surfaces.right.object = mergedObject
            }
        }
    },
    getters: {
    }
})

export default phygitalFace