<template>
    <div class="home">
        <dashboard>
            <main class="main __isActive">
                <section class="main-section">
                    <cube3d v-if="activeComponent === 'cube-3d'"/>
                    <main-cube-faces v-if="activeComponent === 'cube-faces'"/>
                </section>
            </main>
            <aside class="sidebar">
                <section ratio="1x1" @click="select('cube-faces')">
                    <main-cube-faces/>
                </section>
                <section ratio="4x1">
                    <cube-config />
                </section>
                <section ratio="1x1" @click="select('cube-3d')">
                    <cube3d  />
                </section>
                <!-- <section></section>
                <cube-config class="section" disabled/> -->
            </aside>
      </dashboard>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue"
import DashboardStore from "@/stores/dashboard"
import MainCubeFaces from "@/components/sections/main-cube-faces.vue"
import CubeConfig from "@/components/sections/cube-config.vue"
import Cube3d from "@/components/sections/cube-3d.vue"
import Dashboard from "@/components/dashboard.vue"
import _ from "lodash"

export default defineComponent ({ 
    name: "homePage",
    components: {Dashboard, MainCubeFaces, CubeConfig,Cube3d},
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
            activeComponent: "cube-3d" as "cube-3d" | "cube-faces",
        }
    },
    methods: {
        select(section: "cube-3d" | "cube-faces") {
            this.activeComponent = section
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
  .main-section {
    height: 100%;
    position: relative;
  }
  section,
  .section {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #eee; 
        
        &[ratio="1x1"] {
            aspect-ratio: 1 / 1;
            width: 100%;
        }
        &[ratio="2x1"] {
            aspect-ratio: 2 / 1;
            width: 100%;
        }
        &[ratio="3x1"] {
            aspect-ratio: 3 / 1;
            width: 100%;
        }
        &[ratio="4x1"] {
            aspect-ratio: 4 / 1;
            width: 100%;
        }
        &[ratio="2x2"] {
            aspect-ratio: 1/ 1;
            width: 50%;
        }
        &[ratio="4x4"] {
            aspect-ratio: 1/ 1;
            width: 25%;
        }
        &[ratio="4x2"] {
            aspect-ratio: 2/ 1;
            width: 25%;
        }
        &[ratio="2x4"] {
            aspect-ratio: 1/ 2;
            width: 50%;
        }
        // &:nth-child(1) { background-color: #eee; }
        // &:nth-child(2) { background-color: #ddd; opacity: 0.8;}
        // &:nth-child(3) { background-color: #ccc; opacity: .8; }
        // &:nth-child(4) { background-color: #bbb; opacity: .8;}
  }
}

.sidebar {
    display: flex;
    flex-flow: row wrap
}
</style>