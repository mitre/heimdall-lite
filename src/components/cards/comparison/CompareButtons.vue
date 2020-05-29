<template>
  <v-col cols="1">
    <div style="text-align:center; left:10px;">
      {{ name }}
    </div>
  </v-col>
</template>

<script lang="ts">
import Vue from "vue";
import { HDFControl } from "inspecjs";
import { context } from "inspecjs";

const Props = Vue.extend({
  props: {
    controls: Array
  }
});

export default class DeltaView extends Props {
  get _controls(): context.ContextualizedControl[] {
    return this.controls as context.ContextualizedControl[];
  }

  get hdf_controls(): HDFControl[] {
    return this._controls.map(c => c.root.hdf);
  }
}
</script>
