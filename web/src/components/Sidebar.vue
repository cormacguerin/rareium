<template>
  <div
    class="sidebar"
    @click="toggleSidebarPanel"
  >
    <div
      v-if="isMobilePanelOpen"
      class="sidebar-backdrop"
    />
    <transition name="slide-mobile">
      <div
        v-if="isMobilePanelOpen"
        class="sidebar-mobile-panel"
      >
        <slot name="mobile" />
      </div>
    </transition>
    <transition name="slide-desktop">
      <div
        :class="sidebarDesktopPanel"
      >
        <div
          v-if="isDesktopPanelOpen[0]"
        />
        <div
          v-if="isDesktopPanelOpen[1]"
        >
          <slot name="desktop-compact" />
        </div>
        <div
          v-if="isDesktopPanelOpen[2]"
        >
          <slot name="desktop-expand" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>

import {mutations, store} from "@/stores/sidebar.js";
import {computed, ref} from "vue";

export default {
    "name": "Sidebar",
    setup () {

        const sidebarDesktopPanel = ref("sidebar-desktop-panel none"),
            toggleSidebarPanel = computed(() => {

                mutations.toggleMobileNav;

            }),
            isMobilePanelOpen = computed(() => store.isMobileNavOpen),
            isDesktopPanelOpen = computed(() => {

                console.log(store.isDesktopNavOpen);

                if (store.isDesktopNavOpen[0]) {

                    sidebarDesktopPanel.value = "sidebar-desktop-panel sidebar-none";

                } else if (store.isDesktopNavOpen[1]) {

                    sidebarDesktopPanel.value = "sidebar-desktop-panel sidebar-compact";

                } else if (store.isDesktopNavOpen[2]) {

                    sidebarDesktopPanel.value = "sidebar-desktop-panel sidebar-expand";

                }
                return store.isDesktopNavOpen;

            });
        return {sidebarDesktopPanel,
            isMobilePanelOpen,
            isDesktopPanelOpen,
            toggleSidebarPanel};

    }
};
</script>
<style>
    .slide-enter-active,
    .slide-leave-active
    {
        transition: all 0.2s ease-in;
    }
    .slide-enter,
    .slide-leave-to {
        transform: translateX(-100%);
        transition: all 150ms ease-out 0s
    }
    .sidebar-backdrop {
        width: 100vw;
        height: 100vh;
        position: fixed;
        mix-blend-mode: multiply;
        top: 0;
        left: 0;
        cursor: pointer;
    }
    .sidebar-none {
        width: 0px;
    }
    .sidebar-compact {
        width: 80px;
    }
    .sidebar-expand {
        width: 300px;
    }
    .sidebar-desktop-panel {
        height: 100%;
        max-width: 300px;
        border-right: 1px solid #D8D8D8;
        padding-top: 100px;
        overflow-y: auto;
        transition: width .2s ease-in-out;
    }
    .sidebar-mobile-panel {
        overflow-y: auto;
        position: fixed;
        left: 0;
        top: 50px;
        height: 100vh;
        width: 100%;
        padding: 150px 20px 0px 20px;
        max-width: 100%;
        transition: width .2s ease-in-out;
        background: white;
        z-index: 1;
    }
    .relative {
        position: relative;
    }
</style>
