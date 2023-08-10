<template>
    <div class="download-model-section" ref="container">
        <div class="download-container" @click="downloadModel">
            <icon class="download-icon" type="save"></icon>
            <label class="download-label">download model</label>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import icon from "@/components/icon.vue"
import Phygital from "@/stores/phygital"
import gsap from "gsap"

export default defineComponent({
    name: "download-model",
    components: {
        icon,
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
    mounted() {
        this.mountedAnimations()
        
    },
    methods: {
        mountedAnimations() {
            // gsap.set(".aztech-underline-1-slot", {
            //     opacity: 0,
            //     x: 2
            // })

            // setTimeout(() => {
            //     gsap.to(this.$el.querySelector(".seed-button g"), {
            //         duration: 1.64,
            //         rotate: 1280,
            //         ease: "elastic.inOut(1, 0.4)",
            //     })

            //     gsap.to(".aztech-underline-1-slot", {
            //         duration: .8,
            //         stagger: .02,
            //         opacity: 1,
            //         delay: .32,
            //         x:0,
            //         ease: "power2.out",
            //     })
            // })
        },
        downloadModel() {
            let filename=  this.phygital.seed + ""
            const seedDom = document.querySelector(".seed-value") as HTMLElement
            if (seedDom) {
                filename = seedDom.innerText
            }
            this.phygital.downloadSTL(filename)
        },
    }
})
</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";
.download-model-section {
    position: relative;
    display: flex;
    flex-flow: row;
    padding: 0 8px;
    justify-content: center;
    width: 100%;
    height: 100%;
    container-type: size;
    container-name: download-model-section;
}


.download-container {
    width: 100%;
    display: flex;
    flex-flow: row;
    gap: 8px;
    font-size: 14px;
    justify-content: start;
    align-items: center;
    font-family: $accentFont;
    
    &:hover {
        cursor: pointer;
        
        .icon-save-arrow {
            animation: hoverSaveIcon .4s ease infinite alternate;
        }
        .download-label {
            translate: 0 0;
            scale: 1.1;
        }
    }
    
    .icon {
        height: 32px;
    }


    .icon-save-arrow {
        transition: ease .24s all;
    }
}

.download-label {
    transition: ease .24s all;
    transform-origin: left center;
    cursor: pointer;
    font-size: 12px;
}

@container download-model-section (min-height: 40px) {
    .download-container {
        .icon {
            height: 40px;
        }
        
        .download-label {
            font-size: 14px;
            padding-left: 4px;
        }
    }
}

@container download-model-section (min-height: 48px) {
    .download-container {
        .download-label {
            font-size: 16px;
            // padding-left: 4px;
        }
    }
}
@container download-model-section (min-height: 56px) {
    .download-container {
        .icon {
            height: 48px;
        }
        .download-label {
            //     font-size: 18px;
            padding-left: 8px;
        }
    }
}
@container download-model-section (min-height: 64px) {
    .download-container {
        .download-label {
            font-size: 18px;
        }
    }
}

</style>
