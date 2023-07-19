<template>
    <div class="cube-config-container" ref="container">
        <label class="seed-container">
            <span class="seed-value">
                <span class="seed-label-container">
                    <strong class="seed-label">
                        seed
                    </strong>
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 124.8 4.09" style="enable-background:new 0 0 124.8 4.09;" xml:space="preserve">
                        <polygon points="121.08,4.34 60.7,4.34 56.86,0.5 0,0.5 0,0 57.06,0 60.9,3.84 120.87,3.84 124.42,0.29 124.78,0.64 "/>
                        <g>
                            <path d="M33.6,0.25h1.92l-0.01,0.01l1.93,1.91h0.64l0.64,0.64v1.28H36.8l-3.2-3.2V0.25L33.6,0.25z M0,0.25h1.92 L1.91,0.25l1.93,1.91h0.64l0.64,0.64v1.28H3.2L0,0.89V0.25L0,0.25z M4.8,0.25h1.92L6.71,0.25l1.92,1.91h0.64l0.64,0.64v1.28H8 l-3.2-3.2V0.25L4.8,0.25z M9.6,0.25h1.92l-0.01,0.01l1.93,1.91h0.64l0.64,0.64v1.28H12.8l-3.2-3.2V0.25L9.6,0.25z M14.4,0.25h1.92 l-0.01,0.01l1.92,1.91h0.64l0.64,0.64v1.28H17.6l-3.2-3.2V0.25L14.4,0.25z M19.2,0.25h1.92l-0.01,0.01l1.93,1.91h0.64l0.64,0.64 v1.28H22.4l-3.2-3.2V0.25L19.2,0.25z M24,0.25h1.92l-0.01,0.01l1.93,1.91h0.64l0.64,0.64v1.28H27.2L24,0.89V0.25L24,0.25z  M28.8,0.25h1.92l-0.01,0.01l1.93,1.91h0.64l0.64,0.64v1.28H32l-3.2-3.2V0.25L28.8,0.25z M38.4,0.25h1.92l-0.01,0.01l1.93,1.91 h0.64l0.64,0.64v1.28H41.6l-3.2-3.2V0.25L38.4,0.25z M43.2,0.25h1.92l-0.01,0.01l1.93,1.91h0.64l0.64,0.64v1.28H46.4l-3.2-3.2V0.25 L43.2,0.25z M48,0.25h1.92l-0.01,0.01l1.93,1.91h0.64l0.64,0.64v1.28H51.2L48,0.89V0.25L48,0.25z M52.8,0.25h1.92l-0.01,0.01 l1.93,1.91h0.64l0.64,0.64v1.28H56l-3.2-3.2V0.25L52.8,0.25z"/>
                            <polygon points="124.8,0.25 122.88,0.25 122.88,2.17 124.8,2.17 124.8,0.25 	"/>
                        </g>
                    </svg>
                </span>
                {{ seed }}
            </span>
            
            <icon type="loader" class="seed-button" label="regenerate" @click="regenerateSeed"/>
            
        </label>
        
        <!-- Block size: {{ phygital.blockSize }}cm -->
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import icon from "@/components/icon.vue"
import Phygital from "@/stores/phygital"
import gsap from "gsap"

export default defineComponent({
    name: "cube-faces",
    components: {
        icon
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
        }
    },
    mounted() {
        this.phygital.generateSeed()
        this.seed = this.phygital.seed
    },
    methods: {
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
            gsap.set(target, {rotate: 0})
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
                        }
                    })
                }
            })
        }
    }
})
</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";
.cube-config-container {
    position: relative;
    display: flex;
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
    font-family: $accentFont;
    display: flex;
    gap: 8px;
    color: $black;
    position: relative;
}

.seed-label-container {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 16px;
    font-size: 14px;
    font-family: Fixedsys;
    font-weight: normal;

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
    width: 180px;
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

</style>
