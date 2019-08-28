<!-- Visualizes a delta between two controls -->
<template>
  <v-card>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card-title>
            {{ `${old_name} -> ${new_name}` }}
          </v-card-title>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          Old data
        </v-col>
        <v-col cols="6">
          New data
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ContextualizedControl } from "@/store/data_store";
import { HDFControl, hdfWrapControl } from "inspecjs";
import { ControlDelta } from "@/utilities/delta_util";

/** Represents a change in a property */
interface Change {
  property_name: string;
  changes: string[];
}

const Props = Vue.extend({
  props: {
    delta: Object // Of type ControlDelta
  }
});

@Component({
  components: {}
})
export default class DeltaView extends Props {
  /** Typed prop getter */
  get _delta(): ControlDelta {
    return this.delta as ControlDelta;
  }

  /** Formatted name for our older control */
  get old_name(): string {
    return hdfWrapControl(this._delta.old.data).start_time || "Old";
  }

  /** Formatted name for our newer control */
  get new_name(): string {
    return hdfWrapControl(this._delta.new.data).start_time || "New";
  }

  /** List of changes to show as rows */
  get changes(): Change[] {
    let changes: Change[] = [];

    // Change in status, obviously.
    if (this._delta.status_changed) {
      changes.push({
        property_name: "Status",
        changes: [
          `${this._delta.old_hdf.status} -> ${this._delta.new_hdf.status}`
        ]
      });
    }

    // Change in code, I guess?
    if (this._delta.delta_code) {
      this._delta.delta_code.forEach(each_change => {
        changes.push();
      });
    }

    // Change in individual control statuses

    // Return all of these changes
    return changes;
  }
}
</script>
