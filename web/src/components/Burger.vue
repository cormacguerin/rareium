<template>
  <div
    id="burger"
    :class="{ 'active' : isBurgerActive }"
    @click.prevent="toggle"
  >
    <slot>
      <button
        type="button"
        class="burger-button"
        title="Menu"
      >
        <span>
          <div>
<!--
            <div
              class="menuIcon"
              v-html="getIcon('SHINOVI_LOGO')"
            />
-->
          </div>
        </span>
      </button>
    </slot>
  </div>
</template>

<script>
import {iconStore} from "@/stores/icon";
import {inject} from "vue";
import {mutations, store} from "@/stores/sidebar.js";

export default {
    "name": "Burger",
    setup () {

        const icon = iconStore(),
            serverConfig = inject("serverConfig"),
            getIcon = function (i) {

                if (serverConfig.visualMode === "dark") {

                    return icon.get(`${i}_DARK`);

                }
                return icon.get(`${i}_LIGHT`);

            },
            toggle = function () {

                if (serverConfig.view === "mobile") {

                    mutations.toggleMobileNav();

                } else {

                    // mutations.cycleDesktopNav();

                }

            },
            isBurgerActive = function () {

                return store.isMobileNavOpen;

            };

        return {getIcon,
            "icon": icon.get,
            isBurgerActive,
            serverConfig,
            toggle};

    }
};
</script>
<style>
.hidden {
  visibility: hidden;
}

button {
  cursor: pointer;
}

/* remove blue outline */
button:focus {
  outline: 0;
}

img.shinovi-header-icon {
  height: 50px;
}

.burger-button {
  border: 0;
  border-radius: 0;
  background-color: transparent;
  pointer-events: all;
  transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.menuIcon {
  width: 56px;
  height: 56px;
  color: white;
  background-size: contain;
  z-index: 1;
}
</style>
