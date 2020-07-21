<!-- Visualizes a delta between two controls -->
<template>
  <v-card>
    <v-container fluid>
      <!-- Header stuff -->
      <v-row justify="center">
        <v-col cols="12">
          <span class="font-weight-black"> Header changes: </span>
        </v-col>
      </v-row>

      <ChangeItem
        v-for="change in header_changes.changes"
        :key="change.name"
        :change="change"
        :shift="shift"
      >
      </ChangeItem>

      <!-- <ChangeItem 
        v-for="change in code_changes.changes" 
        :key="change.name"
        :change="change"
      >
      </ChangeItem> -->

      <!-- Result stuff -->
      <v-row v-if="result_changes.length > 0" justify="center">
        <v-col cols="12">
          <span class="font-weight-black"> Result changes: </span>
        </v-col>
      </v-row>

      <!-- A title per changed segment. We truncate these -->
      <!-- <v-row class="background lighten-2">
        <v-col cols="3" xs="3" sm="2" md="2" lg="1" xl="1"> </v-col>
        <v-col
          v-for="(name, i) in shifted_names"
          :key="i"
          cols="4"
          xs="4"
          sm="3"
          md="3"
          lg="3"
          xl="3"
        >
          {{ name }}
        </v-col>
      </v-row> -->
      <v-row>
        <v-col cols="3" xs="3" sm="2" md="2" lg="1" xl="1"> </v-col>
        <v-col
          v-for="(control, i) in shown_tests"
          :key="i"
          cols="4"
          xs="4"
          sm="3"
          md="3"
          lg="3"
          xl="3"
        >
          <div v-if="control">
            <ControlRowCol
              v-for="(result, index) in control.root.data.results"
              :key="index"
              :class="zebra(index)"
              :result="result"
              :statusCode="result.status"
            >
            </ControlRowCol>
          </div>
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
    delta: Object, // Of type ControlDelta
    shift: Number
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

  get shown_tests(): (context.ContextualizedControl | null)[] {
    let shown = [];
    for (
      let i = this.shift;
      i < this._delta.controlsandnull.length && i < this.shift + 3;
      i++
    ) {
      shown.push(this._delta.controlsandnull[i]);
    }
    return shown;
  }

  // get names(): string[] {
  //   return this._delta.controlsandnull.map(c => {
  //     if (c === null) {
  //       return "";
  //     }
  //     return c!.root.hdf.start_time || "No Start Time"
  //   });
  // }

  /**
   * Wrapped getters to utilize vue caching, and also just make things easier in the template.
   */
  get header_changes(): ControlChangeGroup {
    return this._delta.header_changes;
  }

  // get shifted_names(): string[] {
  //   console.log("here");
  //   return this.names.splice(0, this.shift);
  // }

  //TODO: Code Diff
  // get code_changes(): ControlChangeGroup | undefined {
  //   return this._delta.code_changes;
  // }

  //returns changes in results
  // get result_changes(): ControlChangeGroup[] | undefined {
  //   return this._delta.segment_changes;
  // }

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
