<template>
  <BaseView>
    <!-- Topbar config - give it a search bar -->
    <template #topbar-content>
      Topbar stuff
    </template>

    <!-- The main content: comparisons of each set of controls in control_sets, etc -->
    <template #main-content>
      <v-container fluid grid-list-md pa-2>
        <v-row>
          <v-col cols="5">
            <div style="position:relative; top:14px;">
              <h1>
                Evaluation Comparisons
              </h1>
            </div>
          </v-col>
          <v-col cols="4"> </v-col>
          <v-col cols="3">
            <v-checkbox
              color="blue"
              v-model="checkbox"
              :label="'Only Changed Tests'"
            ></v-checkbox>
          </v-col>
        </v-row>
        <v-row justify="space-around">
          <v-col xs="4" :cols="statusCols" v-for="(file, i) in files" :key="i">
            <v-card class="fill-height">
              <v-card-title class="justify-center">{{
                file.filename
              }}</v-card-title>
              <v-card-actions class="justify-center">
                <StatusChart
                  :filter="{ fromFile: file.unique_id }"
                  :value="null"
                  :show_compliance="true"
                />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <v-card>
          <v-card-title>Test Evaluations</v-card-title>
          <hr />
          <v-row>
            <v-col cols="1" />
            <ProfileRow
              v-for="(file, i) in files"
              :key="i"
              :name="file.filename"
            />
          </v-row>
          <CompareRow
            v-for="(control_set, i) in show_set"
            :controls="control_set"
            class="my-4"
            :key="i"
          />
        </v-card>
      </v-container>
    </template>

    <!-- File select modal toggle -->
    <v-btn
      bottom
      color="teal"
      dark
      fab
      fixed
      right
      @click="dialog = !dialog"
      :hidden="dialog"
    >
      <v-icon>add</v-icon>
    </v-btn>

    <!-- File select modal -->
    <UploadNexus v-model="dialog" @got-files="dialog = false" />
  </BaseView>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import BaseView from "@/views/BaseView.vue";
import Modal from "@/components/global/Modal.vue";
import UploadNexus from "@/components/global/UploadNexus.vue";
import CompareRow from "@/components/cards/comparison/CompareRow.vue";

import { Filter } from "@/store/data_filters";
import { ControlStatus, Severity, context } from "inspecjs";
import { FileID } from "@/store/report_intake";
import {
  ComparisonContext,
  ControlDelta,
  ControlSeries
} from "../utilities/delta_util";
import DeltaView from "@/components/cards/comparison/DeltaView.vue";
import { getModule } from "vuex-module-decorators";
import InspecDataModule from "../store/data_store";
import ApexPieChart, { Category } from "@/components/generic/ApexPieChart.vue";
import StatusCountModule from "@/store/status_counts";
import ProfileRow from "@/components/cards/comparison/ProfileRow.vue";
import StatusChart from "@/components/cards/StatusChart.vue";
import { EvaluationFile } from "@/store/report_intake";

// We declare the props separately
// to make props types inferrable.
const Props = Vue.extend({
  props: {}
});

@Component({
  components: {
    BaseView,
    Modal,
    UploadNexus,
    CompareRow,
    ApexPieChart,
    ProfileRow,
    StatusChart,
    DeltaView
  }
})
export default class Compare extends Props {
  categories: Category<ControlStatus>[] = [
    {
      label: "Passed",
      value: "Passed",
      color: "statusPassed"
    },
    {
      label: "Failed",
      value: "Failed",
      color: "statusFailed"
    },
    {
      label: "Not Applicable",
      value: "Not Applicable",
      color: "statusNotApplicable"
    },
    {
      label: "Not Reviewed",
      value: "Not Reviewed",
      color: "statusNotReviewed"
    },
    {
      label: "Profile Error",
      value: "Profile Error",
      color: "statusProfileError"
    }
  ];

  get series(): number[] {
    let counts: StatusCountModule = getModule(StatusCountModule, this.$store);
    return [
      counts.passed({}),
      counts.failed({}),
      counts.notApplicable({}),
      counts.notReviewed({}),
      counts.profileError({})
    ];
  }

  /** Whether or not the model is showing */
  dialog: boolean = false;
  checkbox: boolean = false;

  /** Yields the current two selected reports as an ExecDelta,  */
  get curr_delta(): ComparisonContext {
    let data_store = getModule(InspecDataModule, this.$store);
    const all_executions = data_store.contextualExecutions;
    return new ComparisonContext(all_executions);
  }

  /** Yields the control pairings in a more easily consumable list form */
  get control_sets(): ControlSeries[] {
    return Object.values(this.curr_delta.pairings);
  }

  get delta_sets(): ControlSeries[] {
    var delt = [];
    var i;
    var curr_con;
    for (i in this.curr_delta.pairings) {
      curr_con = this.curr_delta.pairings[i];
      if (curr_con[1] == undefined) {
        continue;
      }
      if (curr_con[0].root.hdf.status != curr_con[1].root.hdf.status) {
        delt.push(curr_con);
      }
    }
    return Object.values(delt);
  }

  get show_set(): ControlSeries[] {
    if (this.checkbox) {
      return this.delta_sets;
    }
    return this.control_sets;
  }

  get statusCols(): number {
    return Math.floor(12 / this.files.length);
  }

  get files(): EvaluationFile[] {
    let data_store = getModule(InspecDataModule, this.$store);
    return data_store.executionFiles;
  }
}
</script>

<style lang="scss" scoped>
.compare-header {
  top: 100px;
}
.theme--light .zebra-table {
  background-color: var(--v-secondary-lighten1);
}
</style>
