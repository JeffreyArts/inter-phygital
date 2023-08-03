<!-- 
use the .vpg-svg-content for styling the content inside the box. Best way is to style it via the parent component/route that you put this element in.
 -->

 <template>
     <div class="vpg-svg-editable" :class="[
         phygital.editMode ? '__isEditMode' : '',
         '__isBlock'
        ]">
        <figure ref="vpgSVG" @mousedown="hasClicked" @mousemove="mouseMove"/>
        <svg style="display:none;" id="grid-point-container" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 24" xml:space="preserve">
            <g class="grid-point" id="grid-point">
                <circle  class="center_ring"  cx="12.5" cy="12.5" r="4"/>
                <circle  class="inner-ring"  cx="12.5" cy="12.5" r="8"/>
                <circle  class="outer-ring"  cx="12.5" cy="12.5" r="12"/>
                <line class="line-horizontal" x1="12.5" y1="8.5" x2="12.5" y2="16.5"/>
                <line class="line-vertical" x1="16.5" y1="12.5" x2="8.5" y2="12.5"/>
            </g>
        </svg>
    </div>


</template>


<script lang="ts">
import { defineComponent } from "vue"
import { SVG } from "@svgdotjs/svg.js"
import gsap from "gsap"
import objectHash from "object-hash"

import DrawSVGPlugin from "gsap/DrawSVGPlugin"
import Phygital from "@/stores/phygital"
import _ from "lodash"


export default defineComponent({
    name: "vpg-svg-editable",
    props: {
        vpgPattern: {
            type: Object,
            required: true,
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
            svg: SVG(),
            orientation: "portrait" as "portrait" | "landscape",
            cellSize: 0,
            verticalLines: 0,
            horizontalLines: 0,
            removeNewLine: false,
            offset: {x:1, y:1} as {x:number, y:number},
            grid: [] as Array<Array<number>>,
            surfacePolylines: [] as Array<Array<{x:number, y:number}>>,
            newLine: [] as Array<{x:number, y:number}>,
            removableLine: null as null | HTMLElement,
            removingLine: false,
            surfaceInTransition: false
        }
    },
    watch: {
        "phygital.editMode": {
            handler(editMode) {
                this.surfaceInTransition = true
                if (editMode) {
                    gsap.to(".grid-point", {
                        opacity: 1,
                        ease: "back.out(3.2)",
                        duration: 0.8,
                        stagger: {
                            grid: [this.horizontalLines, this.verticalLines],
                            each: 24/Math.max(this.horizontalLines, this.verticalLines)/32,
                            from: "edges",
                        }
                    })
                    gsap.to(".vpg-line", {
                        strokeWidth: 30,
                        strokeLinecap: "round",
                        duration: 0.8,
                        ease: "back.out(3.2)",
                        onComplete: () => {
                            this.surfaceInTransition = false
                        }
                    })
                } else {
                    gsap.to(".grid-point", {
                        opacity: 0,
                        duration: 1,
                        stagger: {
                            grid: [this.horizontalLines, this.verticalLines],
                            each: 24/Math.max(this.horizontalLines, this.verticalLines)/32,
                            from: "center"
                        }
                    })
                    gsap.to(".vpg-line", {
                        strokeWidth: Math.round(this.cellSize / 2),
                        strokeLinecap: "square",
                        duration: 1.44,
                        ease: "back.out(1.7)",
                    })
                }
            }
        },
        "vpgPattern.polylines": {
            handler() {
                const el = this.$el
                if (!el) return

                const surfacePolylines = _.cloneDeep(this.vpgPattern.polylines)

                
                if (this.newLine.length == 1 || this.removableLine) {
                    if (this.removableLine) {
                        this.removableLine = null
                    }
                    
                    if (this.newLine.length == 1) {
                        const newLine = this.surfacePolylines[this.surfacePolylines.length-1]
                        const cords = [] as Array<{x:number, y:number}>
                        const coordinates = _.map(newLine, cord => {
                            cords.push({
                                x: this.offset.x + cord.x,
                                y: this.offset.y + cord.y
                            })
                            return `${(this.offset.x + cord.x) * this.cellSize + this.cellSize/2},${(this.offset.y + cord.y) * this.cellSize + this.cellSize/2}`
                        }).join(" ")

                        if (cords.length < 2) {
                            return
                        }

                        const polyline = this.svg.polyline(coordinates).attr({
                            class: "vpg-line",
                            dataX1: cords[0].x,
                            dataY1: cords[0].y,
                            dataX2: cords[1].x,
                            dataY2: cords[1].y,
                            style: `stroke-width: 30px;
                            stroke-linecap: round;
                            opacity: 1;
                            stroke: #1c1c1e;`
                        })
                        const group = this.svg.findOne(".vpg-pattern")
                        if (!group) {
                            console.error("Missing .vpg-pattern group")
                            return
                        }
                        polyline.addTo(group, 0)
                        this.newLine.length = 0
                    }
                    return
                } 

                this.surfaceInTransition = true
                this.surfacePolylines = surfacePolylines                
                const promise1 = this.removeGridPoints(true)
                const promise2 = this.removeSurface(true)
                Promise.all([promise1, promise2]).then(() => {
                    this.defineGrid()
                    const p1 = this.defineSurface()
                    const p2 = this.defineGridPoints()
                    this.svg.viewbox(0,0, this.cellSize * this.horizontalLines,  this.cellSize * this.verticalLines)   

                    Promise.all([p1, p2]).then(() => {
                        this.surfaceInTransition = false
                    })
                })
            },
            deep: true
        }
        
    },
    mounted() {
        gsap.registerPlugin(DrawSVGPlugin)
        this.surfacePolylines = _.cloneDeep(this.vpgPattern.polylines)
        this.initialiseSVG()
        window.addEventListener("resize", this.updateSVG)
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.updateSVG)
    },
    
    methods: {
        defineGrid() {  
            this.orientation = this.$el.clientWidth > this.$el.clientHeight ? "landscape" : "portrait"
            this.offset = {x:1, y:1}
            this.verticalLines = this.vpgPattern.height + 2
            this.cellSize = this.$el.clientHeight/this.verticalLines
            this.horizontalLines = Math.ceil(this.$el.clientWidth  / this.cellSize)
            if ((this.vpgPattern.width % 2 != 0 && this.horizontalLines % 2 == 0) ||
                (this.vpgPattern.width % 2 == 0 && this.horizontalLines % 2 != 0))
            {
                this.horizontalLines += 1
            }
            this.cellSize = this.$el.clientWidth/this.horizontalLines
            this.offset.x = Math.floor(this.horizontalLines / 2) - 1
            
            this.grid = []
            for (let y = 0; y < this.verticalLines; y++) {
                this.grid[y] = []
                for (let x = 0; x < this.horizontalLines; x++) {
                    
                    
                    const found = _.find(this.surfacePolylines, p => {
                        return _.find(p, (cord, pIndex) => {
                            if (cord.x == x - this.offset.x && cord.y == y - this.offset.y) {
                                return true
                            }

                            const p1 = {x: x - this.offset.x, y: y - this.offset.y}
                            const p2 = cord
                            const p3 = p[pIndex+1] ? p[pIndex+1] : p[0]

                            if (this.isBetweenCoordinates(p1,p2,p3)) {
                                return true
                            }
                            return false
                        })
                    })

                    if (found) {
                        this.grid[y][x] = 1
                    } else {
                        this.grid[y][x] = 0
                    }
                }
            }
        },
        defineSurface() {
            return new Promise(resolve => {
                const style = {
                    strokeWidth: Math.round(this.cellSize / 2),
                    strokeLinecap: "square",
                }

                if (this.phygital.editMode) {
                    style.strokeWidth = 30
                    style.strokeLinecap = "round"
                }

                // remove old vpg-pattern group when available
                if (this.$el.querySelector(".vpg-pattern")) {
                    this.$el.querySelector(".vpg-pattern").remove()
                }
                const polylines = this.svg.group().addClass("vpg-pattern")
                _.each(this.surfacePolylines, p => {
                    const cords = [] as Array<{x:number, y:number}>
                    const coordinates = _.map(p, cord => {
                        cords.push({
                            x: this.offset.x + cord.x,
                            y: this.offset.y + cord.y
                        })
                        return `${(this.offset.x + cord.x) * this.cellSize + this.cellSize/2},${(this.offset.y + cord.y) * this.cellSize + this.cellSize/2}`
                    }).join(" ")


                    if (cords.length <2) {
                        return
                    }

                    polylines.add(this.svg.polyline(coordinates).attr({
                        class: "vpg-line",
                        dataX1: cords[0].x,
                        dataY1: cords[0].y,
                        dataX2: cords[1].x,
                        dataY2: cords[1].y,
                        fill:"none",
                    }))
                })
                

                gsap.set(".vpg-line", {
                    strokeWidth: 0,
                    strokeLinecap: style.strokeLinecap,
                })
                gsap.to(".vpg-line", {
                    strokeWidth: style.strokeWidth,
                    duration: 1.44,
                    ease: "power4.out",
                    onComplete() {
                        resolve(true)
                    }
                })
            })
                
        },
        defineGridPoints() {
            return new Promise(resolve => {
                const gridPointContainer = this.$el.querySelector("#grid-point-container") as SVGElement
                
                // remove old grid-points group when available
                if (this.$el.querySelector(".grid-points")) {
                    this.$el.querySelector(".grid-points").remove()
                }
                const gridPoints = this.svg.group().addClass("grid-points")

                for (let y = 0; y < this.verticalLines; y++) {
                    for (let x = 0; x < this.horizontalLines; x++) {
                        const gridPoint = this.drawGridPoint(gridPointContainer, x, y)
                        if (gridPoint) {
                            gridPoints.add(gridPoint)
                        }
                    }
                }
                
                this.svg.add(gridPoints)
                
                if (this.phygital.editMode)  {
                    gsap.to(".grid-point", {
                        opacity: 1,
                        duration: .8,
                        ease: "power4.out",
                        onComplete: () => {
                            resolve(true)
                        }
                    })
                } else {
                    resolve(true)
                }
            })
        },
        removeSurface(hard = true as boolean) {
            // If hard is true, remove the domElements from the svg, otherwise only hide them
            return new Promise(resolve => {
                if (this.$el.querySelectorAll(".vpg-line").length == 0) {
                    return resolve(true)
                }

                const lines = document.querySelectorAll(".vpg-line")
                const timelines = [] as Array<Promise<boolean>>
                lines.forEach((line, index) => {
                    timelines.push(new Promise((resolve2) => {
                        const tl = gsap.timeline()
                        tl.to(line, {
                            drawSVG: "0.01%",
                            ease: "power2.out",
                            duration: .48,
                            delay: index * .08,
                        }).to(line, {
                            opacity: 0,
                            strokeWidth:0,
                            duration: .24,
                            onComplete: () => {
                                setTimeout(() => {
                                    resolve2(true)
                                }, 240)
                            }
                        })
                    }))
                })

                Promise.all(timelines).then(() => {
                    if (!hard) {
                        return resolve(true)
                    }
                    const svgContainer = this.$refs["vpgSVG"] as HTMLElement
                    if (!svgContainer) return
                    const children =  svgContainer.querySelectorAll(".vpg-line")
                    if (children.length > 0) {
                        for (let i = 0; i < children.length; i++) {
                            const parentNode = children[i].parentNode
                            if (parentNode) {
                                parentNode.removeChild(children[i])
                            }
                        }
                    }
                    resolve(true)
                })
            })
        },
        removeGridPoints(hard = true as boolean) {
            // If hard is true, remove the domElements from the svg, otherwise only hide them
            return new Promise(resolve => {

                if (this.$el.querySelectorAll(".grid-point").length == 0) {
                    return resolve(true)
                }

                gsap.to(".grid-point", {
                    opacity: 0,
                    duration: .64,
                    // stagger: {
                    //     grid: [this.horizontalLines, this.verticalLines],
                    //     each: 24/Math.max(this.horizontalLines, this.verticalLines)/128,
                    //     from: "center"
                    // },
                    ease: "power4.out",
                    onComplete:() => {
                        if (!hard) {
                            return resolve(true)
                        }

                        const svgContainer = this.$refs["vpgSVG"] as HTMLElement
                        if (!svgContainer) return
                        const children =  svgContainer.querySelectorAll(".grid-point")
                        if (children.length > 0) {
                            for (let i = 0; i < children.length; i++) {
                                const parentNode = children[i].parentNode
                                if (parentNode) {
                                    parentNode.removeChild(children[i])
                                }
                            }
                        }
                        
                        return resolve(true)
                    }
                })
            })
        },
        removeLine(target: HTMLElement) {
            const x1 = target.getAttribute("dataX1")
            const x2 = target.getAttribute("dataX2")
            const y1 = target.getAttribute("dataY1")
            const y2 = target.getAttribute("dataY2")
            const gridPoints = this.$el.querySelectorAll(`
                .grid-point[dataX="${x1}"][dataY="${y1}"],
                .grid-point[dataX="${x1}"][dataY="${y2}"],
                .grid-point[dataX="${x2}"][dataY="${y2}"],
                .grid-point[dataX="${x2}"][dataY="${y1}"]
            `)
            const filteredGridPoints = _.compact(_.filter(gridPoints, (gridPoint) => {
                const x = gridPoint.getAttribute("dataX")
                const y = gridPoint.getAttribute("dataY")
                const matches = _.filter(this.$el.querySelector(`
                .vpg-line[dataX1="${x}"][dataY1="${y}"],
                .vpg-line[dataX2="${x}"][dataY2="${y}"],
                .vpg-line[dataX2="${x}"][dataY1="${y}"],
                .vpg-line[dataX1="${x}"][dataY2="${y}"]
                `), (match) => {
                    if (match.target?.classList.contains("__isRemovable") ||
                        match.node?.classList.contains("__isRemovable")
                    ) {
                        return true
                    }
                    return false
                })
                if (matches.length > 0) {
                    return gridPoint
                } 
                return null
            }))
            
            target.classList.add("__isRemovable")
            _.forEach(filteredGridPoints, (gridPoint) => {
                gridPoint.classList.remove("__isActive")
            })
            gsap.to(target, {
                opacity: 0,
                duration: .24,
                onComplete: () => {
                    target.remove()
                }
            })

            this.removingLine = true
            setTimeout(() => {
                this.removingLine = false
            }, 500)

        },
        initialiseSVG() {
            this.svg = SVG()
            const svgContainer = this.$refs["vpgSVG"] as HTMLElement
            if (!svgContainer) return
            this.svg.addTo(svgContainer)
            this.defineGrid()
            this.defineSurface()
            this.defineGridPoints()
            this.svg.viewbox(0,0, this.cellSize * this.horizontalLines,  this.cellSize * this.verticalLines)
        },
        isBetweenCoordinates(coord: {x:number, y:number}, p1: {x:number, y:number}, p2: {x:number, y:number}) {
            return (
                (p1.x <= coord.x && coord.x <= p2.x && p1.y === coord.y) ||
                (p1.x >= coord.x && coord.x >= p2.x && p1.y === coord.y) ||
                (p1.y <= coord.y && coord.y <= p2.y && p1.x === coord.x) ||
                (p1.y >= coord.y && coord.y >= p2.y && p1.x === coord.x)
            )
        },
        pointsToCoord(points: string) {
            const pointsArray = points.split(" ")
            const coord = pointsArray.map(point => {
                const pointArray = point.split(",")
                return {
                    x: Math.round((parseInt(pointArray[0]) - this.cellSize/2) / this.cellSize),
                    y: Math.round((parseInt(pointArray[1]) - this.cellSize/2) / this.cellSize),
                }
            })
            return coord
        },
        drawGridPoint(gridPointSource: SVGElement, x: number, y: number) {

            if (!gridPointSource) return console.error("Define gridPointSource")

            const innerRing = SVG(gridPointSource).findOne("#grid-point .inner-ring") 
            const outerRing = SVG(gridPointSource).findOne("#grid-point .outer-ring") 
            const centerRing = SVG(gridPointSource).findOne("#grid-point .center_ring") 
            const lineHorizontal = SVG(gridPointSource).findOne("#grid-point .line-horizontal")
            const lineVertical = SVG(gridPointSource).findOne("#grid-point .line-vertical")
            
            if (!innerRing || !outerRing || !centerRing || !lineHorizontal || !lineVertical) return
            const cellSize = this.cellSize
            const r1 = innerRing.clone()
            const r2 = outerRing.clone()
            const r3 = centerRing.clone()
            const r4 = lineHorizontal.clone()
            const r5 = lineVertical.clone()
            // Create group svg element
            const gridPoint = this.svg.group().addClass("grid-point")

            gridPoint.attr({
                dataX: x,
                dataY: y
            })

            if (this.grid[y][x] === 1) {
                gridPoint.addClass("__isActive")
            }
                
            r1.attr({
                id: `grid-point-${x}-${y}`,
                cx: x*cellSize + cellSize/2,
                cy: y*cellSize + cellSize/2
            })
            r2.attr({
                id: `grid-point-${x}-${y}`,
                cx: x*cellSize + cellSize/2,
                cy: y*cellSize + cellSize/2
            })
            r3.attr({
                id: `grid-point-${x}-${y}`,
                cx: x*cellSize + cellSize/2,
                cy: y*cellSize + cellSize/2
            })
            r4.attr({
                id: `grid-point-${x}-${y}`,
                x1: x*cellSize + cellSize/2 - 4,
                y1: y*cellSize + cellSize/2,
                x2: x*cellSize + cellSize/2 + 4,
                y2: y*cellSize + cellSize/2,
                style: `transform-origin: ${x*cellSize + cellSize/2}px ${y*cellSize + cellSize/2}px;`
            })
            r5.attr({
                id: `grid-point-${x}-${y}`,
                x1: x*cellSize + cellSize/2,
                y1: y*cellSize + cellSize/2 - 4,
                x2: x*cellSize + cellSize/2 ,
                y2: y*cellSize + cellSize/2 + 4,
                style: `transform-origin: ${x*cellSize + cellSize/2}px ${y*cellSize + cellSize/2}px;`
            })
            gridPoint.add(r3)
            gridPoint.add(r2)
            gridPoint.add(r1)
            gridPoint.add(r4)
            gridPoint.add(r5)

            if ((x - this.offset.x >= 0) &&
                (x - this.offset.x < this.vpgPattern.width) &&
                (y - this.offset.y >= 0) &&
                (y - this.offset.y < this.vpgPattern.height)
            ) {
                gridPoint.addClass("__hasHover")
            }
            

            gsap.set(gridPoint, {opacity: 0})

            return gridPoint
        },
        updateSVG() {
            const svgContainer = this.$refs["vpgSVG"] as HTMLElement
            if (!svgContainer) return
            const children =  svgContainer.querySelectorAll(".vpg-line, .grid-point")
            if (children.length > 0) {
                for (let i = 0; i < children.length; i++) {
                    const parentNode = children[i].parentNode
                    if (parentNode) {
                        parentNode.removeChild(children[i])
                    }
                }
            }
                    
            this.defineGrid()
            this.defineSurface()
            this.defineGridPoints()
            this.svg.viewbox(0,0, this.cellSize * this.horizontalLines,  this.cellSize * this.verticalLines)
        },
        hasClicked(event: MouseEvent) {
            const target = event.target as HTMLElement
            const parentNode = target.parentNode as HTMLElement
            
            if (!this.phygital.editMode) return

            if (this.newLine.length == 0) {
                // Add start of new line
                if (parentNode?.classList.contains("grid-point")) {
                    const x = parentNode.getAttribute("dataX") as string
                    const y = parentNode.getAttribute("dataY") as string
                    this.startNewLine(parseInt(x, 10),parseInt(y, 10))
                }
                
                // Remove a line
                if (target.classList.contains("__isRemovable")) {
                    const coord = this.pointsToCoord(target.getAttribute("points") as string)
                    this.removeLine(target)
                    this.$emit("update:vpgPattern", _.map(coord, (point) => {
                        return {
                            x: point.x - this.offset.x,
                            y: point.y - this.offset.y
                        }
                    }), "remove")
                }
                    
            } else if (this.newLine.length == 1) {
                this.completeNewLine()
            }
        },
        mouseMove(event: MouseEvent) {
            if (this.surfaceInTransition) return
            if (this.removingLine) return
            
            if (this.newLine.length == 0 && this.phygital.editMode) {
                
                const target = event.target as HTMLElement
                if (!target) return

                if (target.classList.contains("vpg-line")) {
                    if (!target.classList.contains("__isRemovable")) {
                        const oldLines = this.$el.querySelectorAll(".__isRemovable")
                        for (let i = 0; i < oldLines.length; i++) {
                            gsap.to(oldLines[i], {
                                duration: 3,
                                stroke: "#1c1c1e", 
                                opacity: 1, 
                            })
                            oldLines[i].classList.remove("__isRemovable")
                        }

                        target.classList.add("__isRemovable")
                    }



                    
                    this.removableLine = target
                    // Add this.removableLine to the end of the list
                    this.removableLine.parentElement?.appendChild(this.removableLine)
                    
                    gsap.killTweensOf(target)
                    gsap.to(target, {
                        duration: .64, 
                        stroke: "#545760",
                        opacity: .72,
                    })

                    
                } else {
                    if (this.removableLine) {
                        gsap.to(this.removableLine, {
                            duration: 3,
                            stroke: "#1c1c1e", 
                            opacity: 1, 
                        })
                        this.removableLine = null
                    }
                }
            }

            if (this.newLine.length == 1 && this.phygital.editMode) {
                if (this.removeNewLine) return
                // sanitize mouse position to match svg element x &  y
                const currentTarget = event.currentTarget as HTMLElement
                if (!currentTarget) return
                const rect = currentTarget.getBoundingClientRect()
                const mouseX = event.clientX - rect.left
                const mouseY = event.clientY - rect.top
                if (!mouseX || !mouseY) return


                // get grid point that is at position event.clientX & event.clientY with a radius of this.cellSize/2
                const gridPoint = this.$el.querySelector(`.grid-point[dataX="${Math.round((mouseX-this.cellSize/2) / this.cellSize)}"][dataY="${Math.round((mouseY-this.cellSize/2) / this.cellSize)}"]`) as HTMLElement
                const newLine = this.$el.querySelector(".new-line") as HTMLElement
                if (gridPoint && gridPoint.classList.contains("__isOption")) {
                    const x = gridPoint.getAttribute("dataX")
                    const y = gridPoint.getAttribute("dataY")
                    if (x && y) {
                        // newLine.setAttribute("x2", `${parseInt(x) * this.cellSize + this.cellSize/2}`)
                        // newLine.setAttribute("y2", `${parseInt(y) * this.cellSize + this.cellSize/2}`)
                        if (newLine.attributes["x2"].value != `${parseInt(x) * this.cellSize + this.cellSize/2}` &&
                            newLine.attributes["y2"].value != `${parseInt(y) * this.cellSize + this.cellSize/2}`) {
                            gsap.to(newLine, {
                                opacity: 1,
                                duration: .8,
                                attr: {
                                    x2: parseInt(x) * this.cellSize + this.cellSize/2,
                                    y2: parseInt(y) * this.cellSize + this.cellSize/2,
                                },
                                ease: "power4.out",
                                
                            })
                        }
                    }
                } else {
                    // Not the most efficent method to do this, but it works
                    gsap.killTweensOf(".new-line")
                    gsap.to(".new-line", {
                        opacity: 0.5,
                        duration: .8,
                        ease: "power4.out",
                    })


                    
                    newLine.setAttribute("x2", `${mouseX}`)
                    newLine.setAttribute("y2", `${mouseY - 15}`)
                }
                
            }
        },
        startNewLine(x: number, y: number) {
            const xClean = x - this.offset.x
            const yClean = y - this.offset.y
            let height = 0
            let width = 0

            if (!x || !y) return
            const gridPoint = this.$el.querySelector(`.grid-point[dataX="${x}"][dataY="${y}"]`) as HTMLElement
            const topPoint = this.$el.querySelector(`.grid-point[dataX="${x}"][dataY="${parseInt(y) - 1}"]`) as HTMLElement
            const bottomPoint = this.$el.querySelector(`.grid-point[dataX="${x}"][dataY="${parseInt(y) + 1}"]`) as HTMLElement
            const leftPoint = this.$el.querySelector(`.grid-point[dataX="${parseInt(x) - 1}"][dataY="${y}"]`) as HTMLElement
            const rightPoint = this.$el.querySelector(`.grid-point[dataX="${parseInt(x) + 1}"][dataY="${y}"]`) as HTMLElement
            

            if (this.phygital.selectedSurface == "bottom") {
                height = this.vpgPattern.height
                width = this.vpgPattern.width
            } else if (this.phygital.selectedSurface == "top") {
                height = this.vpgPattern.height
                width = this.vpgPattern.width
            } else if (this.phygital.selectedSurface == "left") {
                height = this.vpgPattern.height
                width = this.vpgPattern.width
            } else if (this.phygital.selectedSurface == "right") {
                height = this.vpgPattern.height
                width = this.vpgPattern.width
            } else if (this.phygital.selectedSurface == "front") {
                height = this.vpgPattern.height
                width = this.vpgPattern.width
            } else if (this.phygital.selectedSurface == "back") {
                height = this.vpgPattern.height
                width = this.vpgPattern.width
            }


            if (topPoint && yClean > 0) {
                topPoint.classList.add("__isOption")
            }
            if (bottomPoint && yClean < height-1) {
                bottomPoint.classList.add("__isOption")
            }
            if (leftPoint && xClean > 0) {
                leftPoint.classList.add("__isOption")
            }
            if (rightPoint && xClean < width-1) {
                rightPoint.classList.add("__isOption")
            }
            
            const newLine = this.svg.line(
                x*this.cellSize + this.cellSize/2,
                y*this.cellSize+ this.cellSize/2,
                x*this.cellSize + this.cellSize/2,
                y*this.cellSize+ this.cellSize/2
            )

            newLine.attr({
                class: "new-line",
                style: `stroke-width: 30px;
                        stroke-linecap: round;
                        opacity: 0.5;
                        stroke: #1c1c1e;`
            })
            this.svg.add(newLine)
            // gridPoint.classList.add("__isActive")
            this.newLine.push({x: parseInt(x), y: parseInt(y)})
        },
        completeNewLine() {
            this.removeNewLine = true
            const newLineElement = document.querySelector(".new-line")
            if (!newLineElement) return

            const x = parseInt(newLineElement.attributes["x2"].value, 10)
            const y = parseInt(newLineElement.attributes["y2"].value, 10)
            const endPosition = {
                x: Math.round((x - this.cellSize/2) / this.cellSize),
                y: Math.round((y - this.cellSize/2) / this.cellSize)
            }
            const targetPoint = this.$el.querySelector(`.grid-point[dataX="${endPosition.x}"][dataY="${endPosition.y}"]`) as HTMLElement

            
            
            // Cancel new-line animation
            gsap.to(".new-line", {
                opacity: 0,
                duration: .8,
                ease: "power4.out",
                onComplete: () => {
                    this.$el.querySelector(".new-line").remove()
                    this.$el.querySelectorAll(".__isOption").forEach((el) => {
                        el.classList.remove("__isOption")
                    })
                    
                    // Update related variables
                    this.newLine.length = 0
                    this.removeNewLine = false
                }
            })

            // Add new-line
            if (targetPoint.classList.contains("__isOption")) {
                const newLine = [
                    {x: this.newLine[0].x - this.offset.x, y: this.newLine[0].y- this.offset.y},
                    {x: endPosition.x - this.offset.x, y: endPosition.y- this.offset.y}
                ]
                this.surfacePolylines.push(_.cloneDeep(newLine))
                this.$emit("update:vpgPattern", _.cloneDeep(newLine), "add")

                const otherTargetPoint = this.$el.querySelector(`.grid-point[dataX="${this.newLine[0].x}"][dataY="${this.newLine[0].y}"]`) as HTMLElement
                if (!targetPoint.classList.contains("__isActive")) {
                    targetPoint.classList.add("__isActive")
                } 
                if (!otherTargetPoint.classList.contains("__isActive")) {
                    otherTargetPoint.classList.add("__isActive")
                } 

                // Update related variables
                this.removeNewLine = false
            }

            this.$el.querySelectorAll(".__isOption").forEach((el) => {
                el.classList.remove("__isOption")
            })

            
            


        }
        
    }
})
</script>

<style lang="scss" >
@import "./../assets/scss/variables.scss";
.vpg-svg-editable {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    &.__isEditMode {
        svg {
            // .vpg-line {
            //     stroke-width: 30px;
            //     stroke-linecap: round;
            // }
        }
    }
    
    &.__isBlock {
        // .vpg-line {
        //     stroke-linecap: square;
        //     @media (orientation: landscape) {
        //         stroke-width: 3vw;
        //     }
        //     @media (orientation: portrait) {
        //         stroke-width: 3vh;
        //     }
        // }
    }
    figure {
        margin: 0;
        display: flex;
        width: 100%;
        height: 100%;
    }
    
    svg {
        width: 100%;
        max-width: 100%;
        max-height: 100%;
        display: block;
        position: relative;
        // border: 1px solid red;
    }
    
    .grid-point {
        z-index: 1;
        pointer-events: none;
        &.__hasHover {
            pointer-events: all;
            cursor: pointer;
            .inner-ring {
                opacity: 1;
            }
        }
        &.__hasHover:hover {
            
            .line-vertical,
            .line-horizontal {
                scale: 1;
                opacity: 1;
            }
            .outer-ring {
                fill: $light-grey;
                // stroke-width: 0;
            }
        }

        &.__isActive {
            .inner-ring {
                stroke: $dark-grey2;
            }
            .outer-ring {
                stroke: $dark-grey;
                stroke-width: 1px;
            }
        }
        &.__isOption {
            .inner-ring {
                opacity: 0;
            }
            .outer-ring {
                stroke: $dark-grey2;
                stroke-dasharray: 3.2 1.6;
                opacity: 0.5;
            }
            &.__isActive {
                .outer-ring {
                    stroke: $light-grey;
                    stroke-width: 2px;
                }
            }
            &.__hasHover:hover {
                .outer-ring {
                    opacity: 1;
                }
                line {
                    opacity: 0;
                }
                .inner-ring {
                    fill: $light-grey;
                    opacity: 1;
                    stroke: $light-grey2;
                    stroke-dasharray: none;
                }
            }
        }
    }
    
    polyline {
        stroke: $black;
        stroke-width: .5;
        stroke-type: solid;
        stroke-linecap: square;
    }
    .outer-ring {
        stroke: #e4e5ea;
        stroke-width: 2px;
        fill: transparent;
        transition: .32s all ease;
    }
    .inner-ring {
        stroke: #ced1db;
        stroke-width: 1px;
        stroke-dasharray: 3.2 1.6;
        fill: transparent;
        transition: .32s all ease;
        opacity: 0;
    }

    .line-vertical,
    .line-horizontal {
        opacity: 0;
        stroke-width: 2px;
        transition: .32s all ease;
        stroke: #2d2e33;
        scale: .8;
        stroke-linecap: round;  
    }
    
    .center_ring {
        fill: transparent;
    }
}

</style>
