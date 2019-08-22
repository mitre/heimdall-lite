<template functional>
  <v-row no-gutters>
    <v-col class="pa-0" sm="12" :md="props.proportion">
      <slot name="left" />
    </v-col>
    <v-col class="pa-0" sm="12" :md="12 - props.proportion">
      <slot name="right" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {
    proportion: {
      type: Number, // In range 1-12
      required: true
    }
  }
});

@Component
export default class ControlRowHeader extends Props {}
</script>
