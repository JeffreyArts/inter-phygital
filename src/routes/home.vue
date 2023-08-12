<template>
    <div class="home">
        <dashboard>
            <main class="main __isActive">
                <section class="main-section">
                    <section-cube3d v-if="dashboard.activeComponent === 'cube-3d'" name="main"/>
                    <main-cube-faces v-if="dashboard.activeComponent === 'cube-faces'"/>
                </section>
            </main>
            <aside class="sidebar">
                <!-- <section @click="select('cube-faces')">
                    <main-cube-faces/>
                </section> -->
                <section id="s-seed">
                    <section-seed/>
                </section>
                <section id="s-surfaces">
                    <section-surfaces/>
                </section>
                <section id="s-dimensions">
                    <section-meta-dimensions />
                </section>
                <section id="s-cube3d" @click="select('cube-3d')" @mousedown="setSelection" @mousemove="cancelSelection">
                    <section-cube3d name="sidebar" />
                </section>
                <section id="s-download">
                    <section-download/>
                </section>
                <section id="s-view-edit" v-if="dashboard.activeComponent === 'cube-faces'">
                    <section-view-edit-button />
                </section>
                <section id="s-surface-dimensions" v-if="dashboard.activeComponent === 'cube-faces'">
                    <sectionSurfaceDimensions />
                </section>
            </aside>
            <!-- <aside class="sidebar">
            </aside> -->
        </dashboard>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue"
import DashboardStore from "@/stores/dashboard"
import MainCubeFaces from "@/components/sections/main-cube-faces.vue"
import sectionMetaDimensions from "@/components/sections/meta-dimensions.vue"
import sectionSurfaceDimensions from "@/components/sections/surface-dimensions.vue"
import sectionCube3d from "@/components/sections/cube-3d.vue"
import sectionSurfaces from "@/components/sections/surfaces-grid.vue"
import sectionViewEditButton from "@/components/sections/view-edit-button.vue"
import sectionDownload from "@/components/sections/download-model.vue"
import sectionSeed from "@/components/sections/cube-seed.vue"
import Dashboard from "@/components/dashboard.vue"
import _ from "lodash"

export default defineComponent ({ 
    name: "homePage",
    components: {
        Dashboard,
        MainCubeFaces,
        sectionMetaDimensions,
        sectionCube3d,
        sectionSurfaces,
        sectionViewEditButton,
        sectionDownload,
        sectionSeed,
        sectionSurfaceDimensions,
    },
    props: [],
    setup() {
        const dashboard = DashboardStore()
        return {
            dashboard
        }
    },
    data() {
        return {
            selection: {x: 0, y:0}
        }
    },
    mounted() {
        setTimeout(() => {
            window.dispatchEvent(new Event("resize"))
        })
    },
    methods: {
        setSelection(event:MouseEvent) {
            this.selection.x = event.clientX
            this.selection.y = event.clientY
        },
        select(section: "cube-3d" | "cube-faces") {
            if (this.selection.x !== 0 && this.selection.y !== 0) {
                this.dashboard.activeComponent = section
            }
        },
        cancelSelection(event:MouseEvent) {
            if (Math.abs(this.selection.x - event.clientX) > 4 || Math.abs(this.selection.y - event.clientY) > 4) {
                this.selection.x = 0
                this.selection.y = 0
            }
        }
    },
})
</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";

.home {
    min-height:100%;
    min-width: 100%;
    
    .dashboard {
        margin: 32px;
        height: calc(100vh - 64px);
        width: calc(100vw - 64px);
        overflow: hidden;
        &[data-grid="3x8"] {
            .sidebar {
                grid-template-columns: calc(100% / 3) calc(100% / 3 * 2);
                grid-template-rows: calc(100% / 8) calc(100% / 8) calc(100% / 8) calc(100% / 8) calc(100% / 8) calc(100% / 8) calc(100% / 8) calc(100% / 8);
            }
        }
        &[data-grid="3x6"] {
            .sidebar {
                grid-template-columns: calc(100% / 3) calc(100% / 3 * 2);
                grid-template-rows: calc(100% / 6) calc(100% / 6) calc(100% / 6) calc(100% / 6) calc(100% / 6) calc(100% / 6);
            }
        }
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
    
    .sidebar > section,
    .main > section,
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
    }
}

.sidebar {
    display: grid;
    &.__2Columns {
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }
}

.home .dashboard[data-grid="3x6"] {
    #s-seed {
        grid-column: 2;
        grid-row: 1/2;
    }
    #s-surfaces {
        grid-column: 2;
        grid-row: 2/4;
    }
    #s-dimensions {
        grid-column: 2;
        grid-row: 4/5;
    }
    
    #s-cube3d {
        grid-column: 2;
        grid-row: 5/7;
    }
    
    #s-download {
        grid-column: 2;
        grid-row: 5/6;
        display: none;
    }
    #s-view-edit {
        grid-column: 1;
        grid-row:6/7;
    }
}
.home .dashboard[data-grid="3x8"] {
    #s-surfaces {
        grid-column: 2/3;
        grid-row: 2/4;
    }
    #s-dimensions {
        grid-column: 2/3;
        grid-row: 4/5;
    }
    
    #s-cube3d {
        grid-column: 2/3;
        grid-row: 5/7;
    }

    #s-seed {
        grid-column: 2/3;
        grid-row: 1/2;
    }
    
    #s-download {
        grid-column: 2/3;
        grid-row: 7/8;
    }

    #s-view-edit {
        grid-column: 1/2;
        grid-row:8/9;
    }
    #s-surface-dimensions {
        grid-column: 1/2;
        grid-row: 2/3;
    }
}
</style>