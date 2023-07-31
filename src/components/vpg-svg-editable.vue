<!-- 
use the .vpg-svg-content for styling the content inside the box. Best way is to style it via the parent component/route that you put this element in.
 -->

 <template>
    <div class="vpg-svg-editable" :class="[
            phygital.editMode ? '__isEditMode' : '',
            '__isBlock'
        ]">
        <figure ref="vpgSVG" @click="hasClicked" @mousemove="mouseMove"/>
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
            newLine: [] as Array<{x:number, y:number}>
        }
    },
    watch: {
        "phygital.editMode": {
            handler(editMode) {
                if (editMode) {
                    gsap.to(".grid-point", {
                        opacity: 1,
                        ease: "back.out(1.7)",
                        duration: 1,
                        stagger: {
                            grid: [this.horizontalLines, this.verticalLines],
                            each: 24/Math.max(this.horizontalLines, this.verticalLines)/32,
                            from: "edges",
                        }
                    })
                    gsap.to(".vpg-line", {
                        strokeWidth: 30,
                        strokeLinecap: "round",
                        duration: 1.44,
                        ease: "back.out(1.7)",
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
                
                const promise1 = this.removeGridPoints(true)
                const promise2 = this.removeSurface(true)
                Promise.all([promise1, promise2]).then(() => {
                    this.defineGrid()
                    this.defineSurface()
                    this.defineGridPoints()
                    this.svg.viewbox(0,0, this.cellSize * this.horizontalLines,  this.cellSize * this.verticalLines)                    
                })
            },
            deep: true
        }
        
    },
    mounted() {
        gsap.registerPlugin(DrawSVGPlugin)
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
            (this.vpgPattern.width % 2 == 0 && this.horizontalLines % 2 != 0)) {
                this.horizontalLines += 1
            }
            this.cellSize = this.$el.clientWidth/this.horizontalLines
            if (this.orientation == "landscape") {
                
                this.offset.x = Math.floor(this.horizontalLines / 2) - 1
            } else { 
                this.horizontalLines = this.vpgPattern.width + 2
                this.cellSize = this.$el.clientWidth/this.horizontalLines
                this.verticalLines = Math.ceil(this.$el.clientHeight  / this.cellSize)
                if ((this.vpgPattern.height % 2 != 0 && this.verticalLines % 2 == 0) ||
                    (this.vpgPattern.height % 2 == 0 && this.verticalLines % 2 != 0)) {
                    this.verticalLines += 1
                }
                this.cellSize = this.$el.clientHeight/this.verticalLines

                this.offset.y = 1
                // this.offset.y = Math.floor(this.verticalLines / 2) - 1
            }
            

            this.grid = []
            for (let y = 0; y < this.verticalLines; y++) {
                this.grid[y] = []
                for (let x = 0; x < this.horizontalLines; x++) {
                    
                    
                    const found = _.find(this.vpgPattern.polylines, p => {
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
            const style = {
                strokeWidth: Math.round(this.cellSize / 2),
                strokeLinecap: "square",
            }
            if (this.phygital.editMode) {
                style.strokeWidth = 30
                style.strokeLinecap = "round"
            }

            _.each(this.vpgPattern.polylines, p => {
                const coordinates = _.map(p, cord => {
                    // This, plus enlarging viewbox prevents lines to be cut off from edges
                    return `${(this.offset.x + cord.x) * this.cellSize + this.cellSize/2},${(this.offset.y + cord.y) * this.cellSize + this.cellSize/2}`
                    // return `${cord.x+1},${cord.y+1}`
                }).join(" ")



                const polyline = this.svg.polyline(coordinates).attr({
                    fill:"none",
                    class: "vpg-line",
                })
            })
            

            gsap.set(".vpg-line", {
                strokeWidth: 0,
                strokeLinecap: style.strokeLinecap,
            })
            gsap.to(".vpg-line", {
                strokeWidth: style.strokeWidth,
                duration: 1.44,
                ease: "power4.out",
            })
                
        },
        defineGridPoints() {
            const gridPointContainer = this.$el.querySelector("#grid-point-container") as SVGElement
            
            for (let y = 0; y < this.verticalLines; y++) {
                for (let x = 0; x < this.horizontalLines; x++) {
                    this.drawGridPoint(gridPointContainer, x, y)
                }
            }
            if (this.phygital.editMode)  {
                gsap.to(".grid-point", {
                    opacity: 1,
                    duration: .8,
                    ease: "power4.out",
                })
            }
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
                            duration: .64,
                            delay: index * .08,
                        }).to(line, {
                            opacity: 0,
                            strokeWidth:0,
                            duration: .24,
                            onComplete: () => {
                                setTimeout(() => {
                                    resolve2(true)
                                }, 320)
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


            gsap.set(gridPoint, {opacity: 0})

            this.svg.add(gridPoint)
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
                if (parentNode?.classList.contains("grid-point")) {
                    const x = parentNode.getAttribute("dataX") as string
                    const y = parentNode.getAttribute("dataY") as string
                    this.startNewLine(parseInt(x, 10),parseInt(y, 10))
                    
                }
            } else if (this.newLine.length == 1) {
                this.completeNewLine()
                if (parentNode.classList.contains("grid-point")) {
                    // const gridPoint = parentNode as HTMLElement
                    // const x = gridPoint.getAttribute("dataX")
                    // const y = gridPoint.getAttribute("dataY")
                    // this.newLine.push({x: parseInt(x as string), y: parseInt(y as string)})
                    // gridPoint.classList.add("__isActive")

                    // const newLine = this.newLine.map((coord) => {
                    //     return {x: coord.x - this.offset.x, y: coord.y - this.offset.y}
                    // })
                    // this.vpgPattern.polylines.push(newLine)
                    // this.newLine.length = 0
                    // this.$emit("update:vpgPattern", this.vpgPattern)
                }
            }
        },
        mouseMove(event: MouseEvent) {
            if (this.newLine.length == 1) {
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
            if (!x || !y) return
            const gridPoint = this.$el.querySelector(`.grid-point[dataX="${x}"][dataY="${y}"]`) as HTMLElement
            const topPoint = this.$el.querySelector(`.grid-point[dataX="${x}"][dataY="${parseInt(y) - 1}"]`) as HTMLElement
            const bottomPoint = this.$el.querySelector(`.grid-point[dataX="${x}"][dataY="${parseInt(y) + 1}"]`) as HTMLElement
            const leftPoint = this.$el.querySelector(`.grid-point[dataX="${parseInt(x) - 1}"][dataY="${y}"]`) as HTMLElement
            const rightPoint = this.$el.querySelector(`.grid-point[dataX="${parseInt(x) + 1}"][dataY="${y}"]`) as HTMLElement
            
            if (topPoint) {
                topPoint.classList.add("__isOption")
            }
            if (bottomPoint) {
                bottomPoint.classList.add("__isOption")
            }
            if (leftPoint) {
                leftPoint.classList.add("__isOption")
            }
            if (rightPoint) {
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

            
            // if (!targetPoint.classList.contains("__isOption")) {
            // Cancel new-line animation
            gsap.to(".new-line", {
                opacity: 0,
                duration: .8,
                ease: "power4.out",
                onComplete: () => {
                    this.newLine.length = 0
                    this.$el.querySelector(".new-line").remove()
                    this.removeNewLine = false
                    this.$el.querySelectorAll(".__isOption").forEach((el) => {
                        el.classList.remove("__isOption")
                    })
                }
            })

            if (targetPoint.classList.contains("__isOption")) {

                this.$emit("update:vpgPattern", [
                    {x: this.newLine[0].x - this.offset.x, y: this.newLine[0].y- this.offset.y},
                    {x: endPosition.x - this.offset.x, y: endPosition.y- this.offset.y}
                ])
            }
            // }
            this.$el.querySelectorAll(".__isOption").forEach((el) => {
                el.classList.remove("__isOption")
            })
            
            // this.newLine.length = 0
            // this.removeNewLine = false
            // this.vpgPattern.polylines.push(this.newLine)


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
        cursor: pointer;
        z-index: 1;
        &:hover {
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
            &:hover {
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
