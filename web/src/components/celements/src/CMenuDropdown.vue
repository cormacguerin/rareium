<template
  @click="checkClick($event)"
  >
  <component
    :is="'div'"
    v-on-clickaway="hide"
  >
    <slot name="toggler">
      <button
        class="menudropdownbtn"
        @click="toggle()"
      >
        <flex-row class="dashboard-menu-title">
          <img class="menu-icon" :src="getIconUrl('choose')" />
          <div class="toggler-text">
            {{ togglerText }}
          </div>
        </flex-row>
      </button>
    </slot>
    <div
      :class="menuClass"
      @click="hide()"
    >
      <slot />
    </div>
  </component>
</template>

<script>
import { mixin as clickaway } from 'vue3-click-away';
import { ref, toRefs } from 'vue';

export default {
  name: 'CMenuDropdown',
  components: {
  },
  mixins: [clickaway],
  props: {
    togglerText: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  setup (props) {
    const p = toRefs(props),
    menuClass=ref('menudropdownmenu retract'),
    checkClick = function (e) {
      console.log(e)
     // if (
        //$scopedSlots.toggler &&
        //$el.firstElementChild.contains(e.target)
        
     // ) {
        p.toggle(e)
     // }
    },
    open = function (t) {
      p.menuClass.value = 'menudropdownmenu expand'
      p.visible.value = true
    },
    hide = function (t) {
      p.menuClass.value = 'menudropdownmenu retract'
      p.visible.value = false
    },
    toggle = function (t) {
      console.log('toggle')
      console.log(t)
      if (this.visible === false) {
        p.open()
      } else {
        p.hide()
      }
    };
    return {
      checkClick,
      menuClass,
      visible,
      open,
      hide,
      toggle
    }
  },
  created () {
  },
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
.retract {
  width: 0%;
  height: 0;
  transition: width .3s ease, height .3s ease
}
.expand {
  height: 120px;
  transition: width .3s ease, height .3s ease
}
.dashboard-menu-title {
  align-items: center;
  flex-wrap: nowrap;
}
.menudropdownmenu {
  position: absolute;
  white-space: nowrap;
  background-color: white;
  max-height: 240px;
  margin-top: 2px;
  overflow: hidden;
  border-radius: 10px;
  z-indeX: 1;
}
.menudropdownbtn {
  width: 100%;
  height: fit-content;
  max-height: 58px;
  min-height: 50px;
  margin-top: -15px;
  margin-bottom: -15px;
  padding: 0px;
  font-size: inherit;
  min-width: 100px;
  background: none;
  border: none;
  border-bottom: 2px #f7608a solid;
  color: #747474;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  color: #22255c;
  white-space: nowrap;
}
.menudropdownbtn:focus {
}

input.cinput {
  width: 100%;
  margin: 8px 0;
  font-size: 0.9em;
  box-sizing: border-box;
}

.cmenudropdownTitle {
  white-space: nowrap;
  margin: 8px 0;
  font-size: 0.75em;
  font-weight: bold;
  color: #afafaf;
}

img.menu-icon {
  width: 20px;
  height: 20px;
  padding-top: 15px;
  padding-bottom: 5px;
}

.toggler-text {
  margin-left: 15px;
  margin-top: 15px;
}

</style>
