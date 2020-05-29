<template>
  <v-col cols="1">
    <div style="text-align:center; left:10px;">
      {{ name }}
    </div>
  </v-col>
</template>

<script lang="ts">
import Vue from "vue";
const Props = Vue.extend({
  props: {
    name: String
  }
});

export default class DeltaView extends Props {
  get _name(): String {
    return this.name;
  }
}
</script>
