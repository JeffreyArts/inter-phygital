<template>
    <div class="links-section" ref="container">
        <div class="links-section-links">
            <span class="links-section-link" @click="modalAcknowledgementsOpen = true"><span>Acknowledgements</span></span>
            <span class="links-section-link" @click="modalCommisionOpen = true"><span>Commission work</span></span>
        </div>


        <footer class="links-section-footer">
            <svg v-for="n in footerSize" :key="n" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 32 32" style="enable-background:new 0 0 32 32;" xml:space="preserve">
                <path d="M18.1,15.7l10.4,10.4C30.7,23.3,32,19.8,32,16c0-4-1.4-7.6-3.8-10.4L18.1,15.7z"/>
                <path d="M5.6,28.2C8.4,30.6,12,32,16,32s7.6-1.4,10.4-3.8L16,17.8L5.6,28.2z"/>
                <path d="M13.9,15.7L3.8,5.6C1.4,8.4,0,12,0,16c0,3.8,1.3,7.3,3.6,10.1L13.9,15.7z"/>
                <path d="M26.1,3.6C23.3,1.3,19.8,0,16,0S8.7,1.3,5.9,3.6L16,13.7L26.1,3.6z"/>
                <polygon points="0,0 0,5.3 5.3,0 "/>
                <polygon points="0,32 5.3,32 0,26.7 "/>
                <polygon points="32,5.3 32,0 26.7,0 "/>
                <polygon points="32,32 32,26.7 26.7,32 "/>
            </svg>
        </footer>
        <modalAcknowledgements :open="modalAcknowledgementsOpen" @close="modalAcknowledgementsOpen = false"/>
        <modalCommission :open="modalCommisionOpen" @close="modalCommisionOpen = false"/>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import Phygital from "@/stores/phygital"
import modalAcknowledgements from "@/modals/acknowledgements.vue"
import modalCommission from "@/modals/commission.vue"

export default defineComponent({
    name: "links-section",
    components: {
        modalAcknowledgements,
        modalCommission
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
            modalCommisionOpen: false,
            modalAcknowledgementsOpen: false,
            footerSize: 4,
        }
    },
    computed: {
    },
    mounted() {
        // 
    },
    methods: {
        //
    }
})
</script>

<style lang="scss" >
@import "@/assets/scss/variables.scss";
.links-section {
    position: relative;
    display: flex;
    flex-flow: column;
    padding: 0;
    justify-content: space-between;
    align-items: space-between;
    width: 100%;
    height: 100%;
}

.links-section-footer {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    flex-flow: row;
    padding-top: 1em;
    gap: 4px;
    svg {
        height: 12px;
    }
}

.links-section-link {
    display: inline-block;  

    span {
        transition: .32s all ease;
        border-bottom: 1px solid transparent;
    }
    &:hover {
        cursor: pointer;
        letter-spacing: .1px;

        span {
            border-bottom: 1px solid currentColor;
        }
        &:before {
            transform: translateX(2px);
        }
    }
    &:before {
        content: ">";
        transition: .32s all ease;
        padding-right: 8px;
        display: inline-block;
    }
}
</style>
