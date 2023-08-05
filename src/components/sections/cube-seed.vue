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
import AztechUnderline from "@/components/aztech/underline-1.vue"
import gsap from "gsap"

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
            seed: "a-61892379",
            slots: 8
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
            }
        }
    },
    mounted() {
        this.phygital.generateSeed()
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
            
            const slotsAnimation = gsap.fromTo(this, {
                slots: 8,
            },{
                duration: 6.4,
                ease: "power2.out",
                slots: 14,
            })
            gsap.to(target, {
                duration: 1.8,
                rotate: 540,
                onUpdate: () => {
                    this.seed = "a-" + Math.floor(Math.random() * 100000000)
                },
                onComplete: () => {
                    this.phygital.generateSeed()
                    setTimeout(() => {
                        this.seed = this.phygital.seed + ""
                    }, 128)
                    gsap.to(target, {
                        duration: .64,
                        rotate: 720,
                        ease: "elastic.out(1, .4)",
                        onComplete: () => {
                            // kill slots animation
                            slotsAnimation.kill()

                            gsap.to(this, {
                                slots: 8,
                                duration: .8,
                            })
                            this.regenerating = false
                            currentTarget.classList.remove("__isGenerating")
                            gsap.set(target, {rotate: 0})
                        }
                    })
                }
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
    padding: 0 8px;
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
    width: calc(100% - 48px); 
    font-size: 14px;
    text-align: left;
    position: relative;
}

.seed-button {
    // height: 100%;
    // height: 52px;
    // width: 88px;
    width: 48px;
    translate: 8px 0px;
    cursor: pointer;
    .icon-svg {
        height: 32px;
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
        font-size: 16px;
    }
}
@container seed-section-container (min-height: 52px) {
    .seed-value {
        font-size: 18px;
    }
}

@container seed-section-container (min-height: 56px) {
    .seed-value {
        text-align: right;
    }
    .seed-label-container {
        display: block;
    }
}

@container seed-section-container (min-height: 60px) {
    .seed-label-container {
        margin: 4px;
    }
}

@container seed-section-container (min-height: 64px) {
    .seed-label-container {
        margin: 8px;
    }
    .seed-value {
        margin-top: 12px;
        width: calc(100% - 88px); 
    }
    .seed-button {
        height: 48px;
        width: 88px; 
        .icon-svg {
            height: 48px;
        }
        .icon-label {
            display: block;
            // font-family: $defaultFont;
        }
    }
}
</style>
