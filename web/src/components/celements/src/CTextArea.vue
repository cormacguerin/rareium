<template
  @click="checkClick($event)"
  >
  <component
    :is="'div'"
  >
    <div class="cinputTitle">
      {{ input.title.value }}
    </div>
    <textarea
      v-on:input="handleChange"
      v-model="input.value.value"
      :value="input.value.value"
      class="cinput"
      :placeholder=input.placeholder.value
      :disabled=input.disabled.value
      type="text"
      @change="doEmit"
    >
      {{ input.value }}
    </textarea>
  </component>
</template>

<script>
import {ref, toRefs, watch, onMounted} from "vue";

export default {
  name: 'CTextArea',
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
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ["inputValue"],
  setup (props, { emit }) {

    const input = toRefs(props),
      handleChange = function (v) {

        emit("inputValue", input.value.value) 

      };

    return {
      input,
      handleChange
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
.inputbtn {
  min-width: 100px;
  min-height: 35px;
  border: 1px solid #efefef;
  border-radius: 4px;
  color: #fff;
  background-color: transparent;
}
textarea.cinput {
  width: 100%;
  max-width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  font-size: 0.9em;
  font-family: sans-serif;
  box-sizing: border-box;
  border: 2px solid #dfdfdf;
  border-radius: 15px;
}
textarea.cinput:focus {
  border: 2px solid #f7608a !important;
  background-color: white !important;
}
.cinputTitle {
  margin-top: 15px;
  font-size: 0.75em;
  font-weight: bold;
  color: #a046ff;
  text-align: left;
}

</style>
