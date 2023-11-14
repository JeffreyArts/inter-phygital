<template>
    <div class="home">
        <dashboard-overlay />
        <dashboard>
            <main class="main __isActive">
                <section class="main-section">
                    <section-cube3d v-if="activeComponent === 'cube-3d'" name="main"/>
                    <main-cube-faces v-if="activeComponent === 'cube-faces'"/>
                </section>
            </main>
            <aside class="sidebar">
                <!-- <section @click="select('cube-faces')">
                    <main-cube-faces/>
                </section> -->
                <section id="s-seed">
                    <section-seed/>
                </section>
                <section id="s-surfaces" @click="select('cube-faces')" @mousedown="setSelection">
                    <section-surfaces :activeComponent="activeComponent"/>
                </section>
                <section id="s-dimensions">
                    <section-meta-dimensions />
                </section>
                <section id="s-cube3d" @click="select('cube-3d')" @mousedown="setSelection" @mousemove="cancelSelection">
                    <section-cube3d name="sidebar" />
                    <svg :class="activeComponent === 'cube-3d' ? '__isHidden' : ''" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 37 64" xml:space="preserve">
                        <path d="M30.9,11v18.8h-1.7V4.4h-6.1v25.4h-1.7V0h-6.1v29.8h-1.7V3.3H7.7v35.9H6.1V19.9H0v25.7C0,55.7,8.3,64,18.5,64 C28.7,64,37,55.7,37,45.5V11H30.9z M13.2,41.4H17v-3.9h3.9v3.9h3.9v3.9h-3.9v3.9H17v-3.9h-3.9V41.4z M19,58.4 c-6.4,0-11.7-4.8-12.4-11h3.9c0.7,4.1,4.2,7.2,8.5,7.2c4.3,0,7.8-3.1,8.5-7.2h3.9C30.7,53.6,25.4,58.4,19,58.4z"/>
                    </svg>

                </section>
                <section id="s-download">
                    <section-download/>
                </section>
                <section id="s-links">
                    <section-links/>
                </section>
                <section id="s-view-edit" v-if="activeComponent === 'cube-faces'">
                    <section-view-edit-button />
                </section>
                <section id="s-surface-dimensions" v-if="activeComponent === 'cube-faces'">
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
import MainCubeFaces from "@/sections/main-cube-faces.vue"
import sectionMetaDimensions from "@/sections/meta-dimensions.vue"
import sectionSurfaceDimensions from "@/sections/surface-dimensions.vue"
import sectionCube3d from "@/sections/cube-3d.vue"
import sectionSurfaces from "@/sections/surfaces-grid.vue"
import sectionViewEditButton from "@/sections/view-edit-button.vue"
import sectionDownload from "@/sections/download-model.vue"
import sectionLinks from "@/sections/links.vue"
import sectionSeed from "@/sections/cube-seed.vue"
import Dashboard from "@/components/dashboard.vue"
import DashboardOverlay from "@/components/dashboard-overlay.vue"
import _ from "lodash"
import gsap from "gsap"

export default defineComponent ({ 
    name: "homePage",
    components: {
        Dashboard,
        DashboardOverlay,
        MainCubeFaces,
        sectionMetaDimensions,
        sectionCube3d,
        sectionSurfaces,
        sectionViewEditButton,
        sectionDownload,
        sectionLinks,
        sectionSeed,
        sectionSurfaceDimensions,
    },
    props: [],
    data() {
        return {
            selection: {x: 0, y:0},
            activeComponent: "cube-3d" as "cube-3d" | "cube-faces",
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
                if (this.activeComponent === "cube-faces" && section === "cube-3d") {
                    gsap.to(".vpg-svg-editable polyline", {
                        duration: .8,
                        strokeWidth: 24,
                        ease: "power2.inOut",
                    })
                    gsap.to(".vpg-svg-editable", {
                        duration: .96,
                        opacity: 0,
                        ease: "power4.inOut",
                    })
                    setTimeout(() => {
                        this.activeComponent = section
                    }, 1140)
                    
                } else if (this.activeComponent === "cube-3d" && section === "cube-faces") {
                    gsap.to(".main canvas", {
                        duration: .48,
                        scale: .48,
                        y: "+64",
                        opacity: 0,
                    })
                    setTimeout(() => {
                        this.activeComponent = section
                    }, 480)
                }
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
        // overflow: hidden;
        &[data-grid="6x6"] {
            flex-flow: column;
        }
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
        &[data-grid="6x6"] {
            .sidebar {
                grid-template-columns: calc(100% / 6) calc(100% / 6) calc(100% / 6) calc(100% / 6) calc(100% / 6) calc(100% / 6);
                grid-template-rows: 25% 25% 25% 25%;
            }
        }
    }
    #s-cube3d {
        svg {
            opacity: 0;
            transition: .24s all ease;
            position: absolute;
            right: 16px;
            bottom: 16px;
            width: 24px;
            transform: translateY(180deg);
            &.__isHidden {
                opacity: 0 !important;
            }
        }
        &:hover {
            svg {
                opacity: 1;
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
        position: relative;
        background-color: #eee; 
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

    #s-links {
        grid-column: 2/3;
        grid-row: 8/9;
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


.home .dashboard[data-grid="6x6"] {
    #s-seed {
        grid-column: 3/7;
        grid-row: 2/3;
    }
    #s-surfaces {
        grid-column: 3/7;
        grid-row: 3/5;
    }
    
    #s-cube3d {
        grid-column: 1/3;
        grid-row: 3/4;
    }
    
    #s-dimensions {
        display: none;
    }
    
    #s-download {
        grid-column: 1/3;
        grid-row: 4/5;
    }
    
    #s-view-edit {
        grid-column: 5/7;
        grid-row:1/2;
    }
    #s-surface-dimensions {
        grid-column: 3/5;
        grid-row: 1/2;
    }
}
</style>