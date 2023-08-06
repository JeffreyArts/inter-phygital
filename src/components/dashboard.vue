<!-- 
use the .ascii-box-content for styling the content inside the box. Best way is to style it via the parent component/route that you put this element in.
 -->

<template>
    <div class="dashboard" ref="container">
        <slot />
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import Dashboard from "@/stores/dashboard"

export default defineComponent({
    name: "dashboard-hollywood",
    setup() {
        const dashboard = Dashboard()
        
        return {
            dashboard
        }
    },
    data: () => {
        return {
            fontSize: 32,
            observer: null as null | MutationObserver
        }
    },
    computed: {
        
    },
    watch: {
    
    },
    mounted() {
        // const observer = new MutationObserver(this.updateDashboard)
        if (this.$refs["container"] instanceof HTMLElement) {
            // Clean up old container (only required for hot reload)
            if (this.dashboard.container instanceof HTMLElement) {
                this.dashboard.container.remove()
                this.dashboard.container = null
            }
            this.dashboard.setContainer(this.$refs["container"] as HTMLElement)
        }
    },
})
</script>

<style lang="scss">
@import "./../assets/scss/variables.scss";
.dashboard {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
