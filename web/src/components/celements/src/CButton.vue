<template>
  <component
    :is="'div'"
    v-on-clickaway="hide"
  >
    <slot name="toggler">
      <div>
        <button class="celementbtn">
          {{ togglerText }}
        </button>
      </div>
    </slot>
    <slot />
  </component>
</template>

<script>
import { mixin as clickaway } from 'vue3-click-away'

export default {
  name: 'CButton',
  components: {
  },
  mixins: [clickaway],
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  setup (props) {
    return {
    }
  },
  created () {
  },
  methods: {
    toggle (t) {
      if (this.visible === false) {
        this.open()
      } else {
        this.hide()
      }
    }
  }
}
</script>

<style>
.celementbtn {
  width: inherit;
  height: inherit;
  background: none;
	color: inherit;
	border: none;
	padding: 0;
	font: inherit;
	cursor: pointer;
	outline: inherit;
}
</style>
