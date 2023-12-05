<template
  @click="checkClick($event)"
  >
  <component
    :is="'div'"
  >
    <div class="cinputTitle">
      {{ title }}
    </div>
    <input
      class="cinput"
      type="text"
      :placeholder="placeholder"
      v-on:input="$emit('valueInput', $event.target.value)"
      v-on:keyup.enter="keyupEnter" />
    <div>
      <slot name="toggler">
      </slot>
    </div>
    <div
      :class="menuClass"
      @click="hide()"
    >
    </div>
  </component>
</template>

<script>

export default {
  name: 'CTags',
  components: {
  },
  props: {
    togglerText: {
      type: String,
      default: ''
    },
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
      type: String,
      default: ''
    }
  },
  setup (props) {
    return {
    }
  },
  created () {
  },
  methods: {
    keyupEnter (v) {
      $emit('enterInput', v.target.value)
      v.target.value = ''
    },
    checkClick (e) {
      if (
        $scopedSlots.toggler &&
        $el.firstElementChild.contains(e.target)
      ) {
        toggle(e)
      }
    },
    open (t) {
      menuClass = 'inputmenu visible'
      visible = true
    },
    hide (t) {
      menuClass = 'inputmenu invisible'
      visible = false
    },
    toggle (t) {
      if (visible === false) {
        open()
      } else {
        hide()
      }
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
input.cinput {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  font-size: 0.9em;
  box-sizing: border-box;
  border: 2px solid #dfdfdf;
  border-radius: 15px;
}
input.cinput:focus {
  border: 2px solid #f7608a !important;
  background-color: white !important;
}

</style>
