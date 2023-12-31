import { defineStore } from "pinia"
import shuffleSeed from "@/services/shuffle-seed"
import { Algorithm } from "visual-pattern-generator"
import _ from "lodash"
import { saveAs } from "file-saver"
import * as exportSTL  from "threejs-export-stl"
import { CSG } from "three-csg-ts"
import patternToThreejs from "@/services/pattern-to-threejs.js"
import * as THREE from "three"

interface model3D extends THREE.Group {
    material: THREE.Material;
}

export const phygitalFace = defineStore({
    id: "phygital-face",
    state: () => ({
        surfaces: {
            top: {
                mirrorX: 0,
                mirrorY: 0,
                width: 3,
                height: 3,
                polylines: [] as Array<Array<{x:number, y:number}>>,
                update3D: 0,
                model3D: null as null | model3D
            },
            bottom: {
                mirrorX: 0,
                mirrorY: 0,
                width: 3,
                height: 3,
                polylines: [] as Array<Array<{x:number, y:number}>>,
                update3D: 0,
                model3D: null as null | model3D
            },
            left: {
                mirrorX: 0,
                mirrorY: 0,
                width: 3,
                height: 7,
                polylines: [] as Array<Array<{x:number, y:number}>>,
                update3D: 0,
                model3D: null as null | model3D
            },
            right: {
                mirrorX: 0,
                mirrorY: 0,
                width: 3,
                height: 7,
                polylines: [] as Array<Array<{x:number, y:number}>>,
                update3D: 0,
                model3D: null as null | model3D
            },
            front: {
                mirrorX: 0,
                mirrorY: 0,
                width: 3,
                height: 7,
                polylines: [] as Array<Array<{x:number, y:number}>>,
                update3D: 0,
                model3D: null as null | model3D
            },
            back: {
                mirrorX: 0,
                mirrorY: 0,
                width: 3,
                height: 7,
                polylines: [] as Array<Array<{x:number, y:number}>>,
                update3D: 0,
                model3D: null as null | model3D
            }
        },
        selectedSurface: "top" as "top" | "bottom" | "left" | "right" | "front" | "back",
        openCube: true,
        seed: null as null | string,
        blockSize: 4, // in cm
        model3D: new THREE.Object3D(),
        updating: 0,
        changed: 0,
        editMode: false,
        sandbox: {} as {
            [key: string]: {
                scene: THREE.Scene;
                camera: THREE.PerspectiveCamera;
                renderer: THREE.WebGLRenderer;
            };
        }
    }),
    actions: {
        generateSeed() {
            this.seed = "a-" +_.random(0, 1000000).toString()
        },
        selectSurface(surface: "top" | "bottom" | "left" | "right" |  "front" | "back") {
            this.selectedSurface = surface
        },
        generateDimensions() {
            const surfaces = ["top","left","front"] as Array<"top" | "left" | "front">
            const dimensions = [
                "3x3x3",
                "3x3x5",
                "5x5x3",
                "3x3x7",
            ] 

            
            _.each(surfaces, (surface, index) => {
                if ((typeof this.seed == "undefined" || this.seed == null)) {
                    return new Error("No seed")
                }
                
                const d = shuffleSeed(dimensions, this.seed)[0].split("x") 
                const oppositeSurface = this.getOppositeSurface(surface)
                if (!oppositeSurface) { 
                    return new Error("No opposite surface (invalid surface input)")
                }

                if (surface == "top") {
                    this.surfaces[surface].width = parseInt(d[0], 10)
                    this.surfaces[surface].height = parseInt(d[1], 10)
                    this.surfaces[oppositeSurface].width = parseInt(d[0], 10)
                    this.surfaces[oppositeSurface].height = parseInt(d[1], 10)
                } else if (surface == "left") {
                    this.surfaces[surface].width = parseInt(d[1], 10)
                    this.surfaces[surface].height = parseInt(d[2], 10)
                    this.surfaces[oppositeSurface].width = parseInt(d[1], 10)
                    this.surfaces[oppositeSurface].height = parseInt(d[2], 10)
                } else if (surface == "front") {
                    this.surfaces[surface].width = parseInt(d[0], 10)
                    this.surfaces[surface].height = parseInt(d[2], 10)
                    this.surfaces[oppositeSurface].width = parseInt(d[0], 10)
                    this.surfaces[oppositeSurface].height = parseInt(d[2], 10)
                }

            })

        },
        processSeed() {
            return new Promise ((resolve, reject) => {
                    
                if (!this.seed || _.isNull(this.seed)) {
                    return reject(new Error("No seed"))
                }

                
                const surfaces = ["top","left","front"] as Array<"top" | "left" | "front">
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
                    seed: "",
                    algorithm: {
                        type: "polylines",
                        startPoint: {x:0, y:0},
                        mirrorX: 1,
                        mirrorY: 1,
                        drawConnectLines: true,
                    }
                }

                
                // const mirroringOptionsArray = _.flatten(Array.from({ length: surfaces.length }, () => mirroringOptionValues))
                // mirroringOptionsArray.length = surfaces.length 
                const promises = [] as Array<Promise<any>>
                _.forEach(surfaces, (surface, index) => {
                    if (!this.seed) return
                    // Set mirror options
                    const mirroringOptionValues = ["11"] //first digit is boolean for mirrorX, second digit is boolean for mirrorY
                    if (surface === "left") {
                        mirroringOptionValues.push("10")
                    }
                    if (surface === "front") {
                        mirroringOptionValues.push("10")
                    }
                    const mirroringOptions = shuffleSeed(mirroringOptionValues, this.seed)
                    const mirroringOption = mirroringOptions[0]
                    
                    
                    // Set starting points
                    const startPoints = []
                    for (let x = 0; x < this.surfaces[surface].width/2; x++) {
                        for (let y = 0; y < this.surfaces[surface].height/2; y++) {
                            startPoints.push({x,y})
                        }
                    }
                    const startPointsFiltered = shuffleSeed(startPoints, this.seed)
                    const startPoint = startPointsFiltered[index % startPointsFiltered.length]
                    
                    const vpgOptions = _.cloneDeep(vpgBaseOptions)

                    let seedOffset = "" as string
                    if (surface === "top") { 
                        seedOffset = ".A"
                    } else if (surface === "left") {
                        seedOffset = ".B"
                    } else if (surface === "front") {
                        seedOffset = ".C"
                    }
                        
                    vpgOptions.seed = this.seed+"-"+seedOffset
                    vpgOptions.width = this.surfaces[surface].width
                    vpgOptions.height = this.surfaces[surface].height
                    vpgOptions.algorithm.mirrorX = parseInt(mirroringOption[0], 10)
                    vpgOptions.algorithm.mirrorY = parseInt(mirroringOption[1], 10)
                    vpgOptions.algorithm.startPoint = startPoint

                    promises.push(this.generatePolylines(vpgOptions))
                })

                Promise.all(promises).then((polylines) => {
                    _.each(surfaces, (surface, index) => {
                        const oppositeSurface = this.getOppositeSurface(surface)
                        if (!oppositeSurface) {
                            return
                        }
                        this.surfaces[surface].polylines = polylines[index]
                        this.surfaces[oppositeSurface].polylines = _.cloneDeep(this.surfaces[surface].polylines)
                    })

                    resolve(true)
                })
                
            })
        },
        async generatePolylines(vpgOptions: any) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(Algorithm(vpgOptions).polylines)
                }, 0)
                    
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
                color: "#777",
                tubeThickness: .0125,
            })
            const mergedObject = new THREE.Group() as model3D
            
            pattern3D.forEach((mesh: any, i:number) => {
                mesh.name = `${surfaceSide}-${i}`
                mergedObject.add(mesh)
            })
              
            // for (let i = 1; i < pattern3D.length; i++) {
            //     mergedObject = CSG.toMesh(CSG.fromMesh(mergedObject).union(CSG.fromMesh(pattern3D[i])), mergedObject.matrix)
            // }
            
            

            
            if (surfaceSide === "top") {
                // mergedObject.material = pattern3D[0].material
                // mergedObject.material = new THREE.MeshLambertMaterial( { color: "#f00" })
                mergedObject.name = "face-top"
                mergedObject.position.z = - diameter/2
                mergedObject.position.x = - diameter/2
                mergedObject.position.y = this.surfaces.left.height - diameter/2
                this.surfaces.top.model3D = mergedObject
            }
            if (surfaceSide === "bottom") {
                // mergedObject.material = pattern3D[0].material
                // mergedObject.material = new THREE.MeshLambertMaterial( { color: "#ff0" })
                mergedObject.name = "face-bottom"
                mergedObject.position.z = - diameter/2 
                mergedObject.position.x = - diameter/2 
                mergedObject.position.y = 1 - diameter/2 
                mergedObject.updateMatrix()
                this.surfaces.bottom.model3D = mergedObject
            }
            
            if (surfaceSide === "front") {
                // mergedObject.material = pattern3D[0].material
                // mergedObject.material = new THREE.MeshLambertMaterial( { color: "#0f0" })
                mergedObject.name = "face-front"
                mergedObject.rotateX(Math.PI/180* 90)
                mergedObject.position.z = -diameter + this.surfaces.left.width-1
                mergedObject.position.x = - diameter/2  
                mergedObject.position.y = surface.height
                mergedObject.updateMatrix()
                this.surfaces.front.model3D = mergedObject
            }
            
            if (surfaceSide === "back") {
                // mergedObject.material = pattern3D[0].material
                // mergedObject.material = new THREE.MeshLambertMaterial( { color: "#0ff" })
                mergedObject.name = "face-back"
                mergedObject.rotateX(Math.PI/180* 90)
                mergedObject.position.z = -diameter
                mergedObject.position.x = -diameter/2
                mergedObject.position.y = surface.height
                mergedObject.updateMatrix()
                this.surfaces.back.model3D = mergedObject
            }

            if (surfaceSide === "left") {
                // mergedObject.material = pattern3D[0].material
                // mergedObject.material = new THREE.MeshLambertMaterial( { color: "#00f" })
                mergedObject.name = "face-left"
                mergedObject.rotateY(Math.PI/180* 180)
                mergedObject.rotateX(Math.PI/180* 90)
                mergedObject.rotateZ(Math.PI/180* 90)
                // mergedObject.rotateZ(Math.PI/180* 90)
                mergedObject.position.z = -diameter/2 +  surface.width - 1
                mergedObject.position.x = - diameter
                mergedObject.position.y = surface.height
                mergedObject.updateMatrix()
                this.surfaces.left.model3D = mergedObject
            }
            
            if (surfaceSide === "right") {
                // mergedObject.material = pattern3D[0].material
                // mergedObject.material = new THREE.MeshLambertMaterial( { color: "#f0f" })
                mergedObject.name = "face-right"
                mergedObject.rotateX(Math.PI/180* 90)
                mergedObject.rotateZ(Math.PI/180* 90)
                mergedObject.position.z = - diameter/2 
                mergedObject.position.x = this.surfaces.front.width - 1
                mergedObject.position.y = surface.height
                mergedObject.updateMatrix()
                this.surfaces.right.model3D = mergedObject
            }
            mergedObject.name = `${mergedObject.name}-${Math.ceil(Math.random()*1000)}`
            this.surfaces[surfaceSide].update3D++
        },
        getOppositeSurface(surface: "top" | "bottom" | "left" | "right" |  "front" | "back") {
            if (surface == "top") {
                return "bottom"
            } else if (surface == "bottom") {
                return "top"
            } else if (surface == "left") {
                return "right"
            } else if (surface == "right") {
                return "left"
            } else if (surface == "front") {
                return "back"
            } else if (surface == "back") {
                return "front"
            } else {
                console.error("getOppositeSurface: Invalid input")
            }
        },
        downloadSTL(filename: string) { 
            return new Promise((resolve, reject)=> {       
                let mergedObject = null as null | THREE.Mesh | THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>>
                
                _.each(this.surfaces, (surface) => {
                    if (!_.isNull(surface.model3D)) {
                        surface.model3D.updateMatrix()
                        _.each(surface.model3D.children, (child) => {
                            const newMesh = child.clone() as THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>>
                            if (!surface.model3D) {
                                return
                            }
                            
                            newMesh.position.x += surface.model3D.position.x
                            newMesh.position.y += surface.model3D.position.y
                            newMesh.position.z += surface.model3D.position.z

                            newMesh.rotateX(surface.model3D.rotation.x)
                            newMesh.rotateY(surface.model3D.rotation.y)
                            newMesh.rotateZ(surface.model3D.rotation.z)

                            newMesh.updateMatrix()


                            if (!mergedObject) {
                                mergedObject = newMesh
                                return
                            }
                            if (newMesh)
                                mergedObject.updateMatrix()
                            mergedObject = CSG.toMesh(CSG.fromMesh(mergedObject).union(CSG.fromMesh(newMesh)), mergedObject.matrix)
                        })
                    }
                })
                
                if (!mergedObject) {
                    console.error("No object available")
                    return new Error("noObjectAvailable")
                }
            
                const buffer = exportSTL.fromMesh(mergedObject)
                const blob = new Blob([buffer], { type: exportSTL.mimeType })

                saveAs(blob, `${filename}.stl`)
                return resolve(blob)
            })
        },
    },
    getters: {
    }
})

export default phygitalFace