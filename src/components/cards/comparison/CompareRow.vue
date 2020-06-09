<template>
  <div>
    <v-row>
      <!-- Control ID -->
      <v-col cols="1" class="pt-0">
        <div style="text-align: center; padding: 19px;">
          {{ hdf_controls[0].wraps.id }}
        </div>
      </v-col>

      <!-- Various Statuses -->
      <v-col
        cols="1"
        v-for="(control, index) in hdf_controls"
        filter
        :key="index"
        :value="index"
      >
        <v-btn
          :color="`status${control.status.replace(' ', '')}`"
          centered
          @click="view(index)"
          :depressed="selection[index]"
          :outlined="selection[index]"
        >
          {{ control.status.replace(" ", "\n") }}
        </v-btn>
      </v-col>

      <!-- Depending on selection, more details -->
      <!-- <transition-group> -->
      <v-col cols="12" v-if="delta" key="delta">
        <DeltaView :delta="delta" />
      </v-col>
      <v-col cols="12" v-if="num_selected == 1" key="detail">
        <ControlRowDetails :control="detail_control" />
      </v-col>
      <!-- </transition-group> -->
    </v-row>
    <v-divider dark></v-divider>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { context } from "inspecjs";
import { HDFControl } from "inspecjs";
import { ControlDelta } from "@/utilities/delta_util";
import DeltaView from "@/components/cards/comparison/DeltaView.vue";
import ControlRowDetails from "@/components/cards/controltable/ControlRowDetails.vue";

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {
    controls: Array // Of type Array<ContextualizedControl>
  }
});

@Component({
  components: {
    DeltaView,
    ControlRowDetails
  }
})
export default class CompareRow extends Props {
  /** Models the currently selected chips. If it's a number */
  selection: boolean[] = [];

  /** Initialize our selection */
  mounted() {
    // Pick the first and last control, or as close as we can get to that
    if (this._controls.length === 0) {
      this.selection.splice(0);
    } else if (this._controls.length === 1) {
      this.selection.push(false);
    } else {
      this.selection = [];
      var x;
      for (x in this._controls) {
        this.selection.push(false);
      }
    }
  }

  /** Provides actual data about which controls we have selected */
  get selected_controls(): context.ContextualizedControl[] {
    // Multiple selected
    var selected = [];
    var i;
    for (i = 0; i < this.selection.length; i++) {
      if (this.selection[i]) {
        selected.push(this._controls[i]);
      }
    }
    return selected;
  }

  /** Typed getter on controls */
  get _controls(): context.ContextualizedControl[] {
    return this.controls as context.ContextualizedControl[];
  }

  /** Just maps controls to hdf. Makes our template a bit less verbose */
  get hdf_controls(): HDFControl[] {
    return this._controls.map(c => c.root.hdf);
  }

  /** If exactly two controls selected, provides a delta. Elsewise gives null */
  get delta(): ControlDelta | null {
    if (this.num_selected === 2) {
      return new ControlDelta(
        this.selected_controls[0],
        this.selected_controls[1]
      );
    }
    return null;
  }

  /** Returns the HDF control that we want to show details for iff it is the only selected control */
  get details(): boolean {
    var selected = 0;
    var i;
    for (i = 0; i < this.selection.length; i++) {
      if (this.selection[i]) {
        if (selected == 1) {
          return false;
        }
        selected += 1;
      }
    }
    if (selected == 1) {
      return true; //this.selected_controls[0].root.hdf;
    }
    return false;
  }

  view(index: number) {
    Vue.set(this.selection, index, !this.selection[index]);
    if (this.selection.length == 2) {
      Vue.set(
        this.selection,
        Math.abs(index - 1),
        !this.selection[Math.abs(index - 1)]
      );
    }
  }

  get num_selected(): number {
    var selected = 0;
    var i;
    for (i = 0; i < this.selection.length; i++) {
      if (this.selection[i]) {
        selected += 1;
      }
    }
    return selected;
  }

  get profile_watch(): String {
    return "do nothing";
  }

  color(status: String) {
    if (status == "Passed") {
      return "green";
    } else if (status == "Failed") {
      return "red";
    }
  }

  get detail_control(): context.ContextualizedControl | null {
    for (let i = 0; i < this.selection.length; i++) {
      if (this.selection[i]) {
        return this._controls[i];
      }
    }
    return null;
  }
  /** If more than one row selected */
}
</script>
