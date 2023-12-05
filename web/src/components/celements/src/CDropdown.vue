<template
  @click="checkClick($event)"
  >
  <component
    :is="'div'"
    v-on-clickaway="hide"
  >
    <div class="cdropdownTitle">
      {{ title }}
    </div>
    <slot name="toggler">
      <div>
        <button
          :class="dropDownBtn"
          @click="toggle()"
        >
          {{ togglerText }}
        </button>
      </div>
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
import { mixin as clickaway } from 'vue3-click-away'
import {inject, onMounted, ref, toRefs, watch} from "vue";

export default {
  name: 'CDropdown',
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
    },
    loading: {
      type: Boolean,
      default: true
    }
  },
  setup (props) {
    const menuClass = ref('dropdownmenu invisible'),
      dropDownBtn = ref('dropdownbtn'),
      style = toRefs(props),
      checkClick = function (e) {
        toggle(e)
      },
      open = function(t) {
        menuClass.value = 'dropdownmenu visible'
        setTimeout(
            () => {
                style.visible = true
            },
            200
        );
      },
      hide = function (t) {
        menuClass.value = 'dropdownmenu invisible'
        setTimeout(
            () => {
                style.visible = false
            },
            200
        );
      },
      toggle = function (t) {
        if (style.visible === false || style.visible.value === false) {
          open()
        } else {
          hide()
        }
      };
       
      onMounted (()=> {

        watch(() => props.loading,

            (first, second) => {

              if (v === true) {
                dropDownBtn.value = 'dropdownbtn loading'
              } else {
                dropDownBtn.value = 'dropdownbtn'
              }

            }
        )

      });

    return {
      style,
      menuClass,
      dropDownBtn,
      checkClick,
      open,
      hide,
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
.invisible {
  visibility: hidden;
  opacity: 0;
  height: 0%;
  transition: all .3s ease;
}
.visible {
  visibility: visible;
  opacity: 1;
  height: 100%;
  transition: all .3s ease;
}
.dropdownmenu {
  position: absolute;
  visibility: visible;
  opacity: 1;
  overflow: visible;
  height: auto;
  width: max-content;
  background: white;
  white-space: nowrap;
  border-radius: 15px;
  overflow: auto;
  z-indeX: 1;
}
.dropdownbtn {
  width: 100%;
  height: fit-content;
  max-height: 58px;
  min-height: 50px;
  padding: 12px 20px;
  font-size: 0.9em;
  min-width: 100px;
  border: 2px solid #dfdfdf;
  border-radius: 15px;
  color: #747474;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dropdownbtn:focus {
  border: 2px solid #f7608a !important;
  background-color: white !important;
}

input.cinput {
  width: 100%;
  margin: 8px 0;
  font-size: 0.9em;
  box-sizing: border-box;
}

.cdropdownTitle {
  white-space: nowrap;
  text-align: left;
  margin: 15px 0px 10px 0px;
  font-size: .75em;
  font-weight: 700;
  color: #afafaf;
}

.loading {
    border-color: grey;
    -webkit-animation-name: cycle; /* Chrome, Safari, Opera */
    -webkit-animation-duration: 4s; /* Chrome, Safari, Opera */
    animation-name: cycle;
    animation-duration: 4s;
    animation-iteration-count: infinite;
}

@keyframes cycle {
    0%   {border-color: #ff3a9e; }
    25%  {border-color: #ff3af0; }
    50%  {border-color: #8f3aff; }
    75%  {border-color: #3abfff; }
    100% {border-color: #a13aff; }
}

/* Chrome, Safari, Opera */
@-webkit-keyframes cycle {
    0%   {border-color: #ff3a9e; }
    25%  {border-color: #ff3af0; }
    50%  {border-color: #8f3aff; }
    75%  {border-color: #3abfff; }
    100% {border-color: #a13aff; }
}

</style>
