<template>
  <div class="dropdown-item">
    <slot></slot>
  </div>
</template>

<script>

export default {
  name: 'CDropdownItem',
  components: {
  },
  setup () {
    return {}
  },
  props: {
  },
  created () {
  },
  methods: {
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
.dropdown-item {
  display: block;
  border: none;
  margin: 5px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dropdown-item:hover {
  background-color: #8767f7;
  border-radius: 10px;
  color: white;
}
</style>
