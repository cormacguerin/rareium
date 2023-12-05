<template>
  <transition name="modal">
    <div class="modal-mask" key="signup">
      <div class="modal-wrapper">
        <div :class="modalContainer" :style="borderColor">

          <div class="modal-header flex-row" :style="secondaryColor">
            <div class="header-class">
              <slot name="header" class="header-class">
                header
              </slot>
            </div>
            <div
              class="xclose"
              @click="$emit('close')"
            >
              X
            </div>
          </div>

          <div class="modal-body">
            <slot
              name="body">
              body
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              footer
              <button class="modal-default-button" :style="secondaryColor" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {inject, onMounted, ref, toRefs, watch} from "vue";
export default {
  name: "CModal",
  props: {
    width: {
      type:String,
      default: "small"
    },
    color: {
      type:String,
      default: "white"
    },
    secondaryColor: {
      type:String,
      default: "#ff29b3"
    }
  },
  setup(props) {
    const style = toRefs(props),
        serverConfig = inject("serverConfig"),
        modalContainer = ref("modal-container-" + style.width.value),
        secondaryColor = ref('--modal-background-color:' + style.secondaryColor.value),
        borderColor = ref('--modal-border-color:' + style.secondaryColor.value),
        closeModal = function() {
          //document.querySelector("body").classList.remove("overflow-hidden");
        },
        openModal = function() {
          //document.querySelector("body").classList.add("overflow-hidden");
        };
        onMounted(() => {
            watch(
                () => style.width,
                (first,second) => {

                    modalContainer = 'modal-container-' + first

                }
            )
        });
    return {
      modalContainer,
      secondaryColor,
      borderColor,
      style
    }
  }
};
</script>


<style lang="scss" scoped>
.modal-mask {
  position: fixed;
  display: table;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(.2em);
  transition: all 0.5s ease;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}
.modal-container-small {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  min-width: 300px;
  width: 30%;
  margin: 0px auto;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  font-family: Helvetica, Arial, sans-serif;
  transition: margin 0.5s ease;
}
.modal-container-medium {
  display: flex;
  flex-direction: column;
  max-width: 700px;
  min-width: 300px;
  width: 50%;
  margin: 0px auto;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  font-family: Helvetica, Arial, sans-serif;
  transition: margin 0.5s ease;
}
.modal-container-large {
  display: flex;
  max-width: 1000px;
  min-width: 300px;
  flex-direction: column;
  width: 70%;
  margin: 0px auto;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  font-family: Helvetica, Arial, sans-serif;
  transition: margin 0.5s ease;
}
.modal-container::before {
  margin-top: 1000px;
}
.modal-container::after {
  margin-top: 0px;
}
.modal-header {
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  text-align: left;
  height: 50px;
  border-radius: 13px 13px 0px 0px;
  background-color: var(--modal-background-color);
}
.modal-header h3 {
  text-align: left;
  color: white;
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px;
  overflow: auto;
  max-height: 80vh;
}

.xclose {
  margin-right: 20px;
  font-weight: bold;
  cursor: pointer;
}

.header-class {
  margin-left: 20px;
}

.modal-default-button {
  background-color: var(--modal-background-color);
  color: white;
  float: right;
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.5s ease;
}
.modal-enter, .modal-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transition: all 0.5s ease;
  opacity: 0;
}

.flex-row {
  display: flex;
  flex-direction: row;
}
.flex-col {
  display: flex;
  flex-direction: column;
}

</style>
