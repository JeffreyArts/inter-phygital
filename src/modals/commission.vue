<template>
    <aztechModal class="modal-commission" ref="content" :open="open" @close="closeModal">
        <div class="content">
            <h1>Commission work</h1>
            <p>
                If you would like me to make one of these sculptures for you, let's get in touch. Also if you don't want a sculpture, 
                but you want me to build you a webtool as dope as this one. Hit me up.
            </p>
            <a href="mailto:contact@jeffreyarts.nl">Message me</a>
        </div>
    </aztechModal>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import gsap from "gsap"
import aztechModal from "@/components/aztech/modal.vue"
import aztechButton from "@/components/aztech/button.vue"

export default defineComponent({
    name: "modal-commission",
    components: {
        aztechModal,
        aztechButton
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

.modal-commission .content {
    max-width: 640px;
    padding-bottom: 32px;
    // height: 400px;
    // max-width: 100%;

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