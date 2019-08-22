<template functional>
  <span> {{ props.text }} </span>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {
    text: {
      type: String,
      required: true
    }
  }
});

@Component
export default class ColumnHeader extends Props {}
</script>
