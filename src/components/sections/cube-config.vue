<template>
    <div class="cube-config-container" ref="container">
        <label class="seed-container">
            <strong class="seed-label">
                seed
            </strong>
            <span class="seed-value">
                {{ seed }}
            </span>
            
            <icon type="loader" class="seed-button" label="regenerate" @click="regenerateSeed"/>
            
        </label>
        
        Block size: {{ phygital.blockSize }}cm
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
}

.seed-label {
    display: none;
}

.seed-name {
    font-weight: normal;
}
.seed-value {
    width: 180px;
    text-align: right;
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
