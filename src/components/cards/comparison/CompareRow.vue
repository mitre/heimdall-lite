<template>
  <div :watcher="file_num_watch">
    <v-row>
      <!-- Control ID -->
      <v-col cols="3" xs="3" sm="2" md="2" lg="1" xl="1" class="pt-0">
        <div style="text-align: center; padding: 19px;">
          {{ control_id }}
        </div>
      </v-col>

      <!-- Various Statuses -->
      <v-col
        cols="4"
        xs="4"
        sm="3"
        md="2"
        lg="2"
        xl="1"
        v-for="index in shown_files"
        filter
        :key="index - 1"
        :value="index - 1"
      >
        <v-btn
          v-if="hdf_controls[index - 1 + shift] != null"
          width="100%"
          :color="
            `status${hdf_controls[index - 1 + shift].status.replace(' ', '')}`
          "
          centered
          @click="view(index - 1 + shift)"
          :depressed="selection[index - 1 + shift]"
          :outlined="selection[index - 1 + shift]"
        >
          <template
            v-if="hdf_controls[index - 1 + shift].status == 'Not Applicable'"
          >
            Not <br />
            Applicable
          </template>
          <template
            v-else-if="hdf_controls[index - 1 + shift].status == 'Not Reviewed'"
          >
            Not <br />
            Reviewed
          </template>
          <template v-else>
            {{ hdf_controls[index - 1 + shift].status }}
          </template>
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
import FilteredDataModule from "../../../store/data_filters";
import { getModule } from "vuex-module-decorators";

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {
    controls: Array, // Of type Array<ContextualizedControl>
    shown_files: Number,
    shift: Number
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

  get control_id(): string {
    for (let ctrl of this.hdf_controls) {
      if (ctrl != null) {
        return ctrl.wraps.id;
      }
    }
    return "Error";
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
  get hdf_controls(): Array<HDFControl | null> {
    return this._controls.map(c => {
      if (c == null) {
        return null;
      }
      return c.root.hdf;
    });
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

  get file_num_watch(): string {
    let filter_module = getModule(FilteredDataModule, this.$store);
    this.selection = filter_module.selected_file_ids.map(x => false);
    return filter_module.selected_file_ids.length + "";
  }
  /** If more than one row selected */
}
</script>
