<template
  @click="checkClick($event)"
  >
  <component
    :is="'div'"
  >
    <div class="cswitchTitle">
      {{ input.title.value }}
    </div>
    <div class="switch-container">
      <label class="switch">
        <div class="toggle">
          <input
            :id="switchId"
            class="toggle-state"
            type="checkbox"
            name="check"
            :checked="input.checked"
            v-on:input="handleChange"
            v-model="input.checked"
            value="input.checked" />
          <div class="indicator"></div>
        </div>
        <span class="slider round"></span>
        <div>
          <slot name="toggler">
          </slot>
        </div>
      </label>
    </div>
  </component>
</template>

<script>

import {ref, toRefs, watch, onMounted} from "vue";

export default {
  name: 'CSwitch',
  components: {
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    checked: {
      type: Boolean,
      default: false
    }
  },
  emits: ["inputValue"],
  setup (props, { emit }) {

    const input = toRefs(props),
      isInternal = ref(false),
      switchId = ref(""),
      doAClick = function () {

        const sw = document.getElementById(switchId.value);
        sw.click();

      },
      handleChange = function (v) {

        if (input.checked === true) {

            emit("inputValue", false);

        } else {

            emit("inputValue", true);

        }

      };

      onMounted(() => {

        switchId.value = Math.random().toString(36).substring(2,11);

        setTimeout(
            () => {

              if (input.checked.value === true) {

                doAClick();

              }

            },
            1000
        );

      })

    return {
      input,
      switchId,
      handleChange,
      doAClick
    }
  }
}
</script>

<style>

/* Hide default HTML checkbox */
.switch-container {
  position: relative;
  height: 28px;
  width: 60px;
}

.label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: #394a56;
}

.label-text {
  margin-left: 16px;
}

.toggle {
  isolation: isolate;
  position: relative;
  height: 30px;
  width: 60px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow:
    -8px -4px 8px 0px #ffffff,
    8px 4px 12px 0px #d1d9e6,
    4px 4px 4px 0px #d1d9e6 inset,
    -4px -4px 4px 0px #ffffff inset;
}

.toggle:hover {
  cursor: pointer;
}

.toggle-state {
  display: none;
}

.indicator {
  height: 100%;
  width: 200%;
  background: #ecf0f3;
  border-radius: 15px;
  transform: translate3d(-75%, 0, 0);
  transition: transform 0.4s cubic-bezier(0.85, 0.05, 0.18, 1.35);
  box-shadow:
    -8px -4px 8px 0px #ffffff,
    8px 4px 12px 0px #d1d9e6;
}

.toggle-state:checked ~ .indicator {
  background: #c481e3;;
  transform: all;
  transform: translate3d(25%, 0, 0);
}

.cswitchTitle {
  color: #545454;
  font-size: 0.7em;
  font-weight: bold;
  margin-bottom: 5px;
}

</style>
