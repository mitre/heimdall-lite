<template>
  <v-row>
    <v-col cols="12">
      <v-chip-group multiple max="2">
        <v-chip
          v-for="(control, index) in hdf_controls"
          :key="index"
          :value="index"
        >
          {{ control.status }}
        </v-chip>
      </v-chip-group>
    </v-col>
    <v-col cols="12" v-if="delta">
      Delta goes here
    </v-col>
    <v-col cols="12" v-if="details">
      Details goes here
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ContextualizedControl } from "@/store/data_store";
import { HDFControl, hdfWrapControl } from "inspecjs";
import { ControlDelta } from "@/utilities/delta_util";

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {
    controls: Array // Of type Array<ContextualizedControl>
  }
});

@Component({
  components: {}
})
export default class CompareRow extends Props {
  /** Models the currently selected chips. If it's a number */
  selection: undefined | number[];

  /** Provides actual data about which controls we have selected */
  get selected_controls(): ContextualizedControl[] {
    if (this.selection === undefined) {
      return [];
    } else {
      // Multiple selected
      return this.selection.map(i => this._controls[i]);
    }
  }

  /** Typed getter on controls */
  get _controls(): ContextualizedControl[] {
    return this.controls as ContextualizedControl[];
  }

  /** Just maps controls to hdf. Makes our template a bit less verbose */
  get hdf_controls(): HDFControl[] {
    return this._controls.map(c => hdfWrapControl(c.data));
  }

  /** If exactly two controls selected, provides a delta. Elsewise gives null */
  get delta(): ControlDelta | null {
    if (this.selected_controls.length === 2) {
      return new ControlDelta(
        this.selected_controls[0],
        this.selected_controls[1]
      );
    }
    return null;
  }

  /** Returns the HDF control that we want to show details for iff it is the only selected control */
  get details(): HDFControl | null {
    if (this.selected_controls.length === 1) {
      return hdfWrapControl(this.selected_controls[0].data);
    }
    return null;
  }

  /** If more than one row selected */
}
</script>
