<template>
  <span class="spinner" />
</template>
<script>

import {inject, onMounted, reactive, ref, toRefs, watch} from "vue";

export default {
    "name": "Spinner",
    "components": {
    },
    "props": {
    },
    setup (props) {

        return {};

    }
};
</script>

<style scoped>

.spinner {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-block;
  border-top: 4px solid #FFF;
  border-right: 4px solid transparent;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}
.spinner::after {
  content: '';
  box-sizing: border-box;
  position: absolute;
  left: 0;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border-bottom: 4px solid #FF3D00;
  border-left: 4px solid transparent;
}
@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>
