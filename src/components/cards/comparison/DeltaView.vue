<!-- Visualizes a delta between two controls -->
<template>
  <v-card>
    <v-container fluid>
      <!-- Header stuff -->
      <v-row v-if="header_changes.any" justify="center">
        <v-col cols="12">
          <span class="font-weight-black"> Header changes: </span>
        </v-col>
      </v-row>

      <ChangeItem
        v-for="change in header_changes.changes"
        :key="change.name"
        :colorNew="colorNew"
        :colorOld="colorOld"
      >
        <template #name>
          {{ change.name }}
        </template>
        <template #old>
          {{ change.old }}
        </template>
        <template #new>
          {{ change.new }}
        </template>
      </ChangeItem>

      <ChangeItem v-for="change in code_changes.changes" :key="change.name">
        <template #name>
          {{ change.name }}
        </template>
        <template #old>
          {{ change.old }}
        </template>
        <template #new>
          {{ change.new }}
        </template>
      </ChangeItem>

      <!-- Result stuff -->
      <v-row v-if="result_changes.length > 0" justify="center">
        <v-col cols="12">
          <span class="font-weight-black"> Result changes: </span>
        </v-col>
      </v-row>

      <!-- A title per changed segment. We truncate these -->
      <v-row class="background lighten-2">
        <v-col cols="1"> </v-col>
        <v-col cols="5">
          {{ old_name }}
        </v-col>
        <v-col cols="1"> </v-col>
        <v-col cols="5">
          {{ new_name }}
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="1"> </v-col>
        <v-col cols="5">
          <ControlRowCol
            v-for="(result, index) in _delta.old.root.data.results"
            :key="index"
            :class="zebra(index)"
            :result="result"
            :statusCode="result.status"
          >
          </ControlRowCol>
        </v-col>
        <v-col cols="1"> </v-col>
        <v-col cols="5">
          <ControlRowCol
            v-for="(result, index) in _delta.new.root.data.results"
            :key="index"
            :class="zebra(index)"
            :result="result"
            :statusCode="result.status"
          >
          </ControlRowCol>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {
  context,
  HDFControl,
  HDFControlSegment,
  SegmentStatus
} from "inspecjs";
import { ControlDelta, ControlChangeGroup } from "@/utilities/delta_util";
import { diffArrays, ArrayOptions } from "diff";
import ChangeItem from "@/components/cards/comparison/ChangeItem.vue";
import TruncatedText from "@/components/generic/TruncatedText.vue";
import ControlRowCol from "@/components/cards/controltable/ControlRowCol.vue";
//import vueCodeDiff from 'vue-code-diff';

//TODO: add line numbers
import "prismjs";
import "prismjs/components/prism-makefile.js";
import "prismjs/components/prism-ruby.js";
//@ts-ignore
import Prism from "vue-prism-component";
Vue.component("prism", Prism);

import "prismjs/components/prism-ruby.js";

// Define our props
const Props = Vue.extend({
  props: {
    delta: Object // Of type ControlDelta
  }
});

@Component({
  components: {
    ChangeItem,
    TruncatedText,
    Prism,
    ControlRowCol
  }
})
export default class DeltaView extends Props {
  /** Typed prop getter */
  get _delta(): ControlDelta {
    return this.delta as ControlDelta;
  }

  /** Formatted name for our older control */
  get old_name(): string {
    return this._delta.old.root.hdf.start_time || "Old";
  }

  /** Formatted name for our newer control */
  get new_name(): string {
    return this._delta.new.root.hdf.start_time || "New";
  }

  /**
   * Wrapped getters to utilize vue caching, and also just make things easier in the template.
   */
  get header_changes(): ControlChangeGroup {
    return this._delta.header_changes;
  }

  //color of newer control
  get colorNew(): String {
    if (this._delta.new.root.hdf.status == "Failed") {
      return "red";
    } else if (this._delta.new.root.hdf.status == "Passed") {
      return "green";
    }
    return "clear";
  }

  //color of older control
  get colorOld(): String {
    if (this._delta.old.root.hdf.status == "Failed") {
      return "red";
    } else if (this._delta.old.root.hdf.status == "Passed") {
      return "green";
    }
    return "clear";
  }

  //TODO: Code Diff
  get code_changes(): ControlChangeGroup | undefined {
    return this._delta.code_changes;
  }

  //returns changes in results
  get result_changes(): ControlChangeGroup[] | undefined {
    return this._delta.segment_changes;
  }

  //creates backround zebra affect
  zebra(ix: number): string {
    return ix % 2 ? "" : "zebra-table";
  }
}
</script>
<style lang="scss" scoped>
.theme--dark .zebra-table {
  background-color: var(--v-secondary-lighten2);
}
.theme--light .zebra-table {
  background-color: var(--v-secondary-lighten1);
}
</style>
