<template>
  <v-col cols="4" xs="4" sm="3" md="2" lg="1" xl="1">
    <div style="text-align:center;">
      <i v-if="show_index">{{ index }} </i> <br />
      {{ name }}
    </div>
  </v-col>
</template>

<script lang="ts">
import Vue from "vue";
const Props = Vue.extend({
  props: {
    name: String,
    index: Number,
    show_index: Boolean
  }
});

export default class DeltaView extends Props {
  get _name(): String {
    return this.name;
  }
}
</script>
