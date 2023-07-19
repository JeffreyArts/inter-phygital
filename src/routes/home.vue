<template>
    <div class="home">
        <dashboard>
            <cube-faces class="section"/>
            <section></section>
            <cube-config class="section" disabled/>
            <cube3d class="section"/>
      </dashboard>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue"
import DashboardStore from "@/stores/dashboard"
import CubeFaces from "@/components/sections/cube-faces.vue"
import CubeConfig from "@/components/sections/cube-config.vue"
import Cube3d from "@/components/sections/cube-3d.vue"
import Dashboard from "@/components/dashboard.vue"
import _ from "lodash"

export default defineComponent ({ 
    name: "homePage",
    components: {Dashboard, CubeFaces, CubeConfig,Cube3d},
    props: [],
    setup() {
        const dashboard = DashboardStore()
        return {
            dashboard
        }
    },
    data() {
        return {
            confirmMessage: "",
            amount: 4,
        }
    },
    methods: {
        changeLayout() {
            if (this.dashboard.layoutType == "A") {
                this.dashboard.layoutType = "B"
            } else {
                this.dashboard.layoutType = "A"
            }
          
            this.dashboard.updatePositions()
        },
    },
})
</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";

.home {
  min-height:100%;
  min-width: 100%;

  .dashboard {
      height: 100vh;
      width: 100vw;
      overflow: hidden;
  }
  .layout-modifiers {
      position: absolute;
      left: 50%;
      bottom: 32px;
      transform: translateX(-50%);
  }
  section,
  .section {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #eee; 
        
        // &:nth-child(1) { background-color: #eee; }
        // &:nth-child(2) { background-color: #ddd; opacity: 0.8;}
        // &:nth-child(3) { background-color: #ccc; opacity: .8; }
        // &:nth-child(4) { background-color: #bbb; opacity: .8;}
  }
}
</style>