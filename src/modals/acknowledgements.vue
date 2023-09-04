<template>
    <aztechModal class="modal-acknowledgements" ref="content" :open="open" @close="closeModal">
        <div class="content">
            <h1>Acknowledgements</h1>
            <p>
                It is hard to highlight only some of the projects that has made this project possible, because all projects have had their share in the development of this project. 
                But still I would like to give some of them some extra attention because I really value them and enjoy building with them.
            </p>
            <ul>
                <li>
                    <a href="https://fontforzula.gumroad.com" target="_blank">Font for Zula</a> for the Spacenoid font and the Aztech vector pack
                </li>
                <li>
                    <a href="https://svgjs.dev/" target="_blank">SVG.js</a> for the manipulation of SVG's
                </li>
                <li>
                    <a href="https://threejs.org/" target="_blank">ThreeJS</a> for making it easier to work with 3D on the web
                </li>
            </ul>
        </div>
    </aztechModal>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import gsap from "gsap"
import aztechModal from "@/components/aztech/modal.vue"

export default defineComponent({
    name: "modal-acknowledgements",
    components: {
        aztechModal
    },
    props: {
        open: {
            type: Boolean,
            required: false,
            default: false
        },
    },
    data: () => {
        return {
            isOpen: false,
        }
    },
    methods: {
        closeModal() {
            if (!this.isOpen ) {
                return
            }
            this.isOpen = false
            this.$emit("close", false)
        },
    }
})
</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";

.modal-acknowledgements .content {
    width: 480px;
    height: 400px;
    max-width: 100%;

    h1 {
        margin-bottom: 24px;
        margin-top: 16px;
    }

    ul {
        padding-left: 24px;
    }

    a {
        color: currentColor;
        font-weight: bold;
        text-decoration: underline;
        &:hover {
            text-decoration: none;
        }
    }
}

</style>