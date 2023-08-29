<template>
    <div class="seed-section-container" ref="container">
        <label class="seed-container">
            <span class="seed-value">
                {{ seed }}
                <span class="seed-label-container">
                    <AztechUnderline label="seed" :slots="slots" />
                </span>
            </span>
            
            <icon type="loader" class="seed-button" label="regenerate" ref="generateButton" @click="regenerateSeed"/>
        </label>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import icon from "@/components/icon.vue"
import Phygital from "@/stores/phygital"
import * as THREE from "three"
import AztechUnderline from "@/components/aztech/underline-1.vue"
import gsap from "gsap"
import _ from "lodash"

export default defineComponent({
    name: "cube-config",
    components: {
        icon, AztechUnderline
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
            regenerating: false,
            seed: "a-618929",
            slots: 4
        }
    },
    computed: {
        line() {
            return this.character.repeat(512)
        },
        width() {
            return this.phygital.surfaces.top.width * this.phygital.blockSize
        },
        height() {
            return this.phygital.surfaces.left.height * this.phygital.blockSize
        },
        depth() {
            return this.phygital.surfaces.top.height * this.phygital.blockSize
        }
    },
    watch: {
        "phygital.seed"(value) {
            if (value == "custom" && this.seed != "custom") {
                this.seed = "custom"
            } else {
                this.seed = value
            }
        }
    },
    mounted() {
        this.phygital.generateSeed()
        
        this.phygital.generateDimensions()
        this.updateSurfaces()
        this.seed = this.phygital.seed + ""

        this.mountedAnimations()
        
    },
    methods: {
        mountedAnimations() {
            gsap.set(".aztech-underline-1-slot", {
                opacity: 0,
                x: 2
            })

            setTimeout(() => {
                gsap.to(this.$el.querySelector(".seed-button g"), {
                    duration: 1.64,
                    rotate: 1280,
                    ease: "elastic.inOut(1, 0.4)",
                })

                gsap.to(".aztech-underline-1-slot", {
                    duration: .8,
                    stagger: .02,
                    opacity: 1,
                    delay: .32,
                    x:0,
                    ease: "power2.out",
                })
            })
        },
        regenerateSeed(event:MouseEvent) {
            const currentTarget = event.currentTarget as HTMLElement

            if (this.regenerating) { 
                return
            }

            if (!currentTarget) {
                return
            }

            this.regenerating = true
            currentTarget.classList.add("__isGenerating")
            const target = currentTarget.querySelector("g")
            
            const slotsAnimation = gsap.to(this, {
                duration: 2.2,
                ease: "power2.out",
                slots: 8,
            })



            const randomSeedInterval = setInterval(() => {
                this.seed = "a-" +_.random(0, 1000000).toString()
            }, 64)

            gsap.to(target, {
                duration: 1.28,
                rotate: 360,
                repeat: -1,
                ease: "none",
            })
            this.animateDisapearingMainSandbox().then(() => {
                clearInterval(randomSeedInterval)
                this.seed =  this.phygital.seed + ""
                // kill slots animation
                gsap.killTweensOf(target)
                gsap.to(target, {
                    duration: .64,
                    rotate: 560,
                    ease: "elastic.out(1, .4)",
                })
                setTimeout(() => {

                    slotsAnimation.kill()

                    gsap.to(this, {
                        slots: 4,
                        duration: .8,
                    })
                    this.regenerating = false
                    currentTarget.classList.remove("__isGenerating")
                    gsap.set(target, {rotate: 0})
                }, 0)
                    
            })
            
            
        },
        animateDisapearingMainSandbox() {
            return new Promise ((resolve, reject) => {

                
                if (!this.phygital.sandbox.main) {
                    console.warn("No main sandbox found")
                    return reject(false)
                }

                // Create array with all the parts
                let surfaceObjects = [] as Array<any>
                const model3D = _.find(this.phygital.sandbox.main.scene.children, child => {
                    return child.name == "datamodel"
                })
                if (model3D && model3D.children.length > 0) {
                    _.each(model3D.children, surface => {
                        _.each(surface.children, (child) => {
                            if (!(child instanceof THREE.Mesh)) {
                                return
                            }
                            child.material.transparent = true
                                
                            const material = _.clone(child.material)
                            child.material = material
                            surfaceObjects.push (child)
                        })
                    })                
                }
                surfaceObjects = _.shuffle(surfaceObjects).sort((a,b) => {
                    return a.position.z - b.position.z
                })

                const timeline = gsap.timeline({
                    onComplete: () => {
                        this.phygital.sandbox.main.camera.position.set(20, 8, -2)
                        this.phygital.sandbox.main.camera.zoom = 1.5
                        this.phygital.sandbox.main.camera.updateProjectionMatrix()
                        this.updateSurfaces()
                        
                        // this.phygital.update3DSurface(surface)
                        // this.phygital.update3DSurface(oppositeSurface)
                        return resolve(true)
                    }
                })
                // Animate parts    
                _.each(surfaceObjects, (object, i) => {
                    let newPos = (object.name.startsWith("top") || object.name.startsWith("front")) ? object.position.y + 1 : object.position.y - 1
                    const positionAnimation = gsap.to(object.position, {
                        duration: 0.8,
                        y: newPos,
                        ease: "power4.out",
                        delay: i * .008
                    })
                    
                    
                    const opacityAnimation = gsap.to(object.material, {
                        duration: 0.4,
                        delay: i*.008,
                        opacity: 0,
                        onUpdate: () => {
                            object.material.needsUpdate = true
                        },
                        onComplete: () => {
                            object.material.opacity = 0 // Ensure opacity is set to 0 when animation completes
                            object.material.needsUpdate = true
                        },
                        ease: "none",
                    })

                    timeline.add(positionAnimation, i * 0.01)
                    timeline.add(opacityAnimation, i * 0.02)
                })
                timeline.play()

                // aAfter all parts are animated, remove them from the scene
                this.phygital.generateSeed()
                
                    
                // Animate camera
                gsap.to(this.phygital.sandbox.main.camera, {
                    duration: 1.8,
                    zoom: 1,
                    onUpdate: () => {
                        this.phygital.sandbox.main.camera.updateProjectionMatrix()
                    },
                
                    ease: "power2.out",
                })
            })
        },
        updateSurfaces() {
            this.phygital.processSeed().then(() => {
                this.phygital.update3DSurface("top")
                this.phygital.update3DSurface("bottom")

                this.phygital.update3DSurface("left")
                this.phygital.update3DSurface("right")

                this.phygital.update3DSurface("front")
                this.phygital.update3DSurface("back")
            }) 
        },
        modifyBlockSize(size: number) {
            this.phygital.blockSize = size/this.phygital.surfaces.top.width 
        }
    }
})
</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";
.seed-section-container {
    position: relative;
    display: flex;
    flex-flow: column;
    padding: 0;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    container-type: size;
    container-name: seed-section-container;
}

.seed-container {
    // margin-top: 12px;
    height: 100%;
    font-family: $accentFont;
    display: flex;
    gap: 8px;
    color: $black;
    position: relative;
    justify-content: space-between;
    align-items: center;
}

.seed-label-container {
    // margin-top: 8px;
    display: none;
    
    svg {
        width: 100%;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        min-height: 6px;
    }
    .seed-label {
        margin-right: 10px;
        font-weight: normal;
        margin-bottom: 1px;
    }
}

.seed-name {
    font-weight: normal;
}

.seed-value {
    width: calc(100% - 32px);
    font-size: 14px;
    text-align: left;
    position: relative;
}


.seed-button {
    // height: 100%;
    // height: 52px;
    // width: 88px;
    width: 32px;
    // translate: 8px 0px;
    cursor: pointer;
    .icon-svg {
        height: 24px;
    }
    svg {
        display: inline-block;
        transition: .4s all ease;
        width: 100%;
        g {
            transform-origin: center center;
        }
    }

    &:hover {
        svg {
            rotate: -45deg;
        }
        .icon-label {
            opacity: 1;
        }

        &.__isGenerating {
            // pointer-events: none;
            cursor: wait;
            .icon-label {
                opacity: 0;
            }   
        }
    }
    

    .icon-label {
        opacity: 0;
        display: none;
        font-size: 10px;
        transition: .24s opacity ease;
    }
}

@container seed-section-container (min-height: 44px) {
    .seed-value {
        font-size: 10px;
    }
}

@container seed-section-container (min-height: 60px) {
    .seed-value {
        font-size: 12px;
    }
}

@container seed-section-container (min-height: 70px) {
    .seed-value {
        font-size: 14px;
        width: calc(100% - 32px); 
    }
    .seed-button {
        width: 32px;
        .icon-svg {
            height: 24px;
        }
    }
}

@container seed-section-container (min-height: 76px) {
    .seed-value {
        text-align: right;
        font-size: 16px;
    }
    .seed-label-container {
        display: block;
    }
    .seed-button {
        translate: 0 -8px;
    }
}

@container seed-section-container (min-height: 84px) {
    .seed-label-container {
        margin-top: 4px;
    }
    .seed-value {
        // font-size: 18px;
    }
}

@container seed-section-container (min-height: 96px) {
    .seed-label-container {
        margin-top: 8px;
    }
    .seed-value {
        margin-top: 12px;
        width: calc(100% - 88px); 
    }
    .seed-button {
        height: 48px;
        width: 88px; 
        translate: 0 0;

        .icon-svg {
            height: 36px;
        }
        .icon-label {
            display: block;
            // font-family: $defaultFont;
        }
    }
}
</style>
