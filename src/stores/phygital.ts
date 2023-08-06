import { defineStore } from "pinia"
import shuffleSeed from "@/services/shuffle-seed"
import { Algorithm } from "visual-pattern-generator"
import _ from "lodash"
import { saveAs } from "file-saver"
import * as exportSTL  from "threejs-export-stl"
import { CSG } from "three-csg-ts"
import patternToThreejs from "@/services/pattern-to-threejs.js"
import * as THREE from "three"

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
                model3D: null as null | THREE.Mesh
            },
            bottom: {
                mirrorX: 0,
                mirrorY: 0,
                width: 3,
                height: 3,
                polylines: [] as Array<Array<{x:number, y:number}>>,
                update3D: 0,
                model3D: null as null | THREE.Mesh
            },
            left: {
                mirrorX: 0,
                mirrorY: 0,
                width: 3,
                height: 7,
                polylines: [] as Array<Array<{x:number, y:number}>>,
                update3D: 0,
                model3D: null as null | THREE.Mesh
            },
            right: {
                mirrorX: 0,
                mirrorY: 0,
                width: 3,
                height: 7,
                polylines: [] as Array<Array<{x:number, y:number}>>,
                update3D: 0,
                model3D: null as null | THREE.Mesh
            },
            front: {
                mirrorX: 0,
                mirrorY: 0,
                width: 3,
                height: 7,
                polylines: [] as Array<Array<{x:number, y:number}>>,
                update3D: 0,
                model3D: null as null | THREE.Mesh
            },
            back: {
                mirrorX: 0,
                mirrorY: 0,
                width: 3,
                height: 7,
                polylines: [] as Array<Array<{x:number, y:number}>>,
                update3D: 0,
                model3D: null as null | THREE.Mesh
            }
        },
        selectedSurface: "top" as "top" | "bottom" | "left" | "right" | "front" | "back",
        openCube: true,
        seed: null as null | string,
        blockSize: 1, // in cm
        model3D: new THREE.Object3D(),
        updating: 0,
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
            this.seed = "a-" +_.random(0, 100000000).toString()
        },
        selectSurface(surface: "top" | "bottom" | "left" | "right" |  "front" | "back") {
            this.selectedSurface = surface
        },
        updateSurfaces() {
            return new Promise ((resolve, reject) => {
                    
                if (!this.seed) {
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
                const promises = []
                _.forEach(surfaces, (surface, index) => {

                    // Set mirror options
                    const mirroringOptionValues = ["11"] //first digit is boolean for mirrorX, second digit is boolean for mirrorY
                    if (surface === "left") {
                        mirroringOptionValues.push("10")
                    }
                    if (surface === "back") {
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
                        this.surfaces[surface].polylines = polylines[index]
                        this.surfaces[oppositeSurface].polylines = _.cloneDeep(this.surfaces[surface].polylines)
                    })
                    resolve(true)
                })
                
            })
        },
        async generatePolylines(vpgOptions) {
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
            const mergedObject = new THREE.Group()
            
            pattern3D.forEach((mesh, i) => {
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
                mergedObject.rotateY(Math.PI/180* 180)

                mergedObject.position.z = -diameter
                mergedObject.position.x = -diameter/2 - 1  + surface.width
                mergedObject.position.y = 1
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
        updateSurface(surface: "top" | "bottom" | "left" | "right" |  "front" | "back", value: number) {
            const oppositeSurface = this.getOppositeSurface(surface)
            const side1 = {surface: "", dimension: ""}
            const side2 = {surface: "", dimension: ""}

            // Than define side surfaces
            if (surface == "top" || surface == "bottom") {
                if (dimension == "height") {
                    side1.surface   = "left"
                    side1.dimension = "width"
                    side2.surface   = "right"
                    side2.dimension = "width"
                } else {
                    side1.surface   = "front"
                    side1.dimension = "width"
                    side2.surface   = "back"
                    side2.dimension = "width"
                }
            } else if (surface == "left" || surface == "right") {
                if (dimension == "height") {
                    side1.surface   = "front"
                    side1.dimension = "height"
                    side2.surface   = "back"
                    side2.dimension = "height"
                } else {
                    side1.surface   = "top"
                    side1.dimension = "height"
                    side2.surface   = "bottom"
                    side2.dimension = "height"
                }
            } else if (surface == "front" || surface == "back") {
                if (dimension == "height") {
                    side1.surface   = "left"
                    side1.dimension = "height"
                    side2.surface   = "right"
                    side2.dimension = "height"
                } else {
                    side1.surface   = "top"
                    side1.dimension = "width"
                    side2.surface   = "bottom"
                    side2.dimension = "width"
                }
            } 

            
            this.phygital.surfaces[surface][dimension] = value
            this.phygital.surfaces[oppositeSurface][dimension]     = this.phygital.surfaces[surface][dimension]
            this.phygital.surfaces[side1.surface][side1.dimension] = this.phygital.surfaces[surface][dimension]
            this.phygital.surfaces[side2.surface][side2.dimension] = this.phygital.surfaces[surface][dimension]
            
            clearTimeout(this.updating)
            
            this.updating = setTimeout(() => {
                this.phygital.update3DSurface(surface)
                this.phygital.update3DSurface(oppositeSurface)
            }, 100)
        },
        downloadSTL(filename: string) { 
            return new Promise((resolve, reject)=> {                
                let mergedObject = this.model3D.children[0]
                if (!mergedObject) {
                    console.error("No object available")
                    return new Error("noObjectAvailable")
                }
                this.model3D.children.forEach((child, i) => {
                    
                    mergedObject.updateMatrix()
                    mergedObject = CSG.toMesh(CSG.fromMesh(mergedObject).union(CSG.fromMesh(child)), mergedObject.matrix)
                })
            
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