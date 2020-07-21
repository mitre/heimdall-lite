<!-- Visualizes a delta between two controls -->
<template>
  <v-row>
    <v-col cols="3" xs="3" sm="2" md="2" lg="1" xl="1" class="pa-0">
      <slot name="name" />
    </v-col>
    <v-col
      class="pa-0"
      v-for="(value, i) in values"
      :key="i"
      cols="4"
      xs="4"
      sm="3"
      md="3"
      lg="3"
      xl="3"
    >
      <v-card v-if="value != 'not selected'" class="pa-2" :color="color(value)">
        {{ value }}
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ControlDelta } from "@/utilities/delta_util";

const Props = Vue.extend({
  props: {
    change: Object,
    shift: Number
  }
});

@Component({
  components: {}
})
export default class ChangeItem extends Props {
  color(status: string): string {
    if (this.change.name.toLowerCase() == "status") {
      return `status${status.replace(" ", "")}`;
    }
    return "";
  }

  get values(): string[] {
    let values = [];
    for (
      let i = this.shift;
      i < this.change.values.length && i < this.shift + 3;
      i++
    ) {
      values.push(this.change.values[i]);
    }
    console.log(values);
    return values;
  }
}
</script>
