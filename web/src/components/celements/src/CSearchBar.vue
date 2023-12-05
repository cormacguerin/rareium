<template>
  <component
    @click="checkClick($event)"
    v-click-away="onClickAway"
    :is="'div'"
  >
    <div :class="searchBarClass">
      <div class="csearch-icon"
        v-html="getIcon('SEARCH')"
      />

      <input
        :class="searchBarInput"
        type="text"
        :placeholder="placeholder"
        v-on:input="handleChange" />
<!--
        v-on:keyup.enter="$emit('value', $event.target.value)"
-->
      <slot name="results">
        <div>
        </div>
      </slot>
    </div>
  </component>
</template>

<script>

import { inject, onMounted, ref, toRefs, watch } from 'vue'
import {iconStore} from "@/stores/icon";

export default {
  name: 'CSearchBar',
  components: {
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    type: {
      expand: Boolean,
      default: true
    }
  },
  emits: ["inputValue"],
  setup (props, { emit }) {
    const icon = iconStore(),
    handleChange = function (e) {

        emit("inputValue", e.target.value) 

    },
    searchBarClass = ref('flex-row search-bar'),
    searchBarInput = ref('csearch-bar-input-light'),
    serverConfig = inject("serverConfig");

    onMounted(() => {
        watch(() => serverConfig.visualMode, (v) => {

            if (v === 'dark') {
              searchBarInput.value = 'csearch-bar-input-dark'
            } else {
              searchBarInput.value = 'csearch-bar-input-light'
            }

        });
    });

    function getIcon (i) {
      if (serverConfig.visualMode === 'dark') {
        return icon.get(i + '_DARK');
      } else {
        return icon.get(i + '_LIGHT');
      }
    };

    function checkClick (e) {
      searchBarClass.value = 'flex-row search-bar-clicked'
    };

    function onClickAway () {
      searchBarClass.value = 'flex-row search-bar'
      emit("inputValue", '') 
    };

    function open (t) {
      menuClass.value = 'inputmenu visible'
      visible.value = true
    };

    function hide (t) {
      menuClass.value = 'inputmenu invisible'
      visible.value = false
    };

    function toggle (t) {
      if (visible === false) {
        open()
      } else {
        hide()
      }
    };

    return {
      checkClick,
      getIcon,
      handleChange,
      onClickAway,
      hide,
      icon: icon.get,
      open,
      searchBarClass,
      searchBarInput,
      serverConfig,
      toggle
    }
  }
}
</script>

<style>
@media (max-width: 576px) {
  .desktopNav {
    display: none!important;
  }
}
@media (min-width: 576px) {
  .mobileNav {
    display: none!important;
  }
}
.csearch-icon {
  display: flex;
  align-items: center;
}
.invisible {
  visibility: hidden;
  opacity: 0;
  width: 0%;
  height: 0%;
  transition: visibility .3s .3s ease, opacity .3s 0s, width .3s ease, height .3s ease
}
.visible {
  visibility: visible;
  opacity: 1;
  transition: visibility .3s .3s ease, opacity .3s 0s, width .3s ease, height .3s ease
}
.inputmenu {
  position: absolute;
  overflow: hidden;
  display: block;
  margin-top: 10px;
  font-size: .875rem;
  text-align: left;
  list-style: none;
  background-clip: padding-box;
  border-radius: .25rem;
  color: #373847;
  background-color: #fff;
  border: 1px solid #bcbdc2;
  -webkit-box-shadow: 0 30px 100px 50px rgba(0,0,0,.2);
  -moz-box-shadow: 0 30px 100px 50px rgba(0,0,0,.2);
  box-shadow: 0 30px 100px 50px rgba(0,0,0,.2);
  z-indeX: 1;
}
.inputbtn {
  min-width: 100px;
  min-height: 35px;
  border: 1px solid #efefef;
  border-radius: 4px;
  color: #fff;
  background-color: transparent;
}
.flex-row {
  display: flex;
  flex-direction: row;
}
.search-bar {
  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  color: white;
  flex-grow: 1;
  align-items: center;
}
.search-bar-clicked {
  width: 100%;
  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  color: white;
  flex-grow: 1;
  align-items: center;
}
input.csearch-bar-input-light {
  color: #fff;
  width: 100%;
  height: 20px;
  margin-right: 10px;
  margin-left: 10px;
  border: none;
  border-bottom: 2px solid #fff;
  transition: all ease-in-out .2s;
  font-size: 1.0em;
  background: none;
}
input.csearch-bar-input-light:focus {
  border-bottom: 3px solid #fff;
  outline-width: 0;
  height: 25px;
}
input.csearch-bar-input-dark {
  color: white;
  width: 100%;
  height: 20px;
  margin-right: 10px;
  margin-left: 10px;
  border: none;
  border-bottom: 2px solid #ffffff94;
  transition: all ease-in-out .2s;
  font-size: 1.0em;
  background: none;
}
input.csearch-bar-input-dark:focus {
  border-bottom: 3px solid #ffffff;
  outline-width: 0;
  height: 25px;
}
</style>
