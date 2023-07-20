<template>
    <div class="cube-config-container" ref="container">
        <label class="seed-container">
            <span class="seed-value">
                {{ seed }}
                <span class="seed-label-container">
                    <AztechUnderline label="seed" :slots="8" />
                </span>
            </span>
            
            <icon type="loader" class="seed-button" label="regenerate" ref="generateButton" @click="regenerateSeed"/>
        </label>

        <div class="download-container" @click="downloadModel">
            <icon class="download-icon" type="save"></icon>
            <label class="download-label">download model</label>
        </div>

        <div class="sizes-container">
            <aztech-line />
            <div class="sizes-container-dimensions">
                <aztech-input-number v-model="width" disabled label="width" unit="cm" @increase="modifyBlockSize" @decrease="modifyBlockSize"/>
                <aztech-input-number v-model="height" disabled label="height" unit="cm"  @increase="modifyBlockSize" @decrease="modifyBlockSize"/>
                <aztech-input-number v-model="depth" disabled label="depth" unit="cm"  @increase="modifyBlockSize" @decrease="modifyBlockSize"/>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import icon from "@/components/icon.vue"
import Phygital from "@/stores/phygital"
import AztechLine from "@/components/aztech/line-1.vue"
import AztechUnderline from "@/components/aztech/underline-1.vue"
import AztechInputNumber from "@/components/aztech/input-number.vue"
import gsap from "gsap"

export default defineComponent({
    name: "cube-faces",
    components: {
        icon, AztechUnderline, AztechLine, AztechInputNumber
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
            seed: "a-61892379"
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
    mounted() {
        this.phygital.generateSeed()
        this.seed = this.phygital.seed

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
                    duration: .64,
                    stagger: .02,
                    opacity: 1,
                    x:0,
                    ease: "power2.out",
                })
            })
        },
        regenerateSeed(event:MouseEvent) {
            const currentTarget = event.currentTarget

            if (this.regenerating) { 
                return
            }

            if (!currentTarget) {
                return
            }

            this.regenerating = true
            currentTarget.classList.add("__isGenerating")
            const target = currentTarget.querySelector("g")
            
            gsap.to(target, {
                duration: 1.8,
                rotate: 540,
                onUpdate: () => {
                    this.seed = "a-" + Math.floor(Math.random() * 100000000)
                },
                onComplete: () => {
                    this.phygital.generateSeed()
                    setTimeout(() => {
                        this.seed = this.phygital.seed
                    }, 128)
                    gsap.to(target, {
                        duration: .64,
                        rotate: 720,
                        ease: "elastic.out(1, .4)",
                        onComplete: () => {
                            this.regenerating = false
                            currentTarget.classList.remove("__isGenerating")
                            gsap.set(target, {rotate: 0})
                        }
                    })
                }
            })
        },
        downloadModel() {
            this.phygital.downloadSTL(this.seed)
        },
        modifyBlockSize(size: number) {
            this.phygital.blockSize = size/this.phygital.surfaces.top.width 
        }
    }
})
</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";
.cube-config-container {
    position: relative;
    display: flex;
    flex-flow: column;
    padding: 0 8px;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    // > * {
    //     pointer-events: none;
    // }
    &.__isActive {
        > * {
            pointer-events: all;
        }
    }
}

.seed-container {
    font-size: 24px;
    margin-top: 12px;
    font-family: $accentFont;
    display: flex;
    gap: 8px;
    color: $black;
    position: relative;
    justify-content: space-between;
}

.seed-label-container {
    margin-top: 8px;
    display: block;
    
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
    width: 100%;
    text-align: right;
    position: relative;
}

.seed-button {
    // display: inline-block;
    height: 40px;
    translate: 8px 0px;
    cursor: pointer;

    svg {
        display: inline-block;
        transition: .4s all ease;
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
        font-size: 10px;
        transition: .24s opacity ease;
    }
}

.download-container {
    width: 100%;
    display: flex;
    flex-flow: row;
    gap: 12px;
    font-size: 14px;
    justify-content: start;
    align-items: center;
    font-family: $accentFont;
    
    &:hover {
        cursor: pointer;
        .icon-bg {
            fill: #fff;
            stroke: #fff;
        }
        .download-label {
            translate: 0 0;
            scale: 1.1;
        }
    }
    
    .icon {
        height: 32px;
    }


    .icon-bg {
        transition: ease .24s all;
    }
}

.download-label {
    transition: ease .24s all;
    transform-origin: left center;
    cursor: pointer;
}

.sizes-container {
    padding-right: 14px;
}

.sizes-container-dimensions {
    display: flex;
    flex-flow: row;
    justify-content: space-between;
    align-items:flex-end;
}

</style>
