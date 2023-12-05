/*
 *Import { Observable } from 'vue'
 *
 *export const store = {
 *  isMobileNavOpen: false
 *}
 *
 *export const mutations = {
 *  setIsNavOpen (yesno) {
 *    store.isMobileNavOpen = yesno
 *  },
 *  toggleMobileNav () {
 *    store.isMobileNavOpen = !store.isMobileNavOpen
 *  }
 *}
 */

// Import Vue from 'vue'
import {reactive} from "vue";

// Export const store = Vue.observable({
/*
 *Export const store = Observable({
 *  isMobileNavOpen: false
 *})
 */
const store = reactive({
        "isDesktopNavOpen": [
            true,
            false,
            false
        ],
        "isMobileNavOpen": false
    }),

    mutations = {

        cycleDesktopNav () {

            for (let i = 0; i < store.isDesktopNavOpen.length; i++) {

                if (store.isDesktopNavOpen[i]) {

                    store.isDesktopNavOpen[i] = false;
                    if (i < store.isDesktopNavOpen.length - 1) {

                        store.isDesktopNavOpen[i + 1] = true;

                    } else {

                        store.isDesktopNavOpen[0] = true;

                    }
                    return;

                }

            }
            store.isDesktopNavOpen[0] = true;

        },
        toggleMobileNav () {

            if (store.isDesktopNavOpen[0]) {

                store.isMobileNavOpen = !store.isMobileNavOpen;

            }

        }
    };

export {store, mutations};
