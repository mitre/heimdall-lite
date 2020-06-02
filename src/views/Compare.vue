<template>
  <BaseView>
    <!-- Topbar config - give it a search bar -->
    <template #topbar-content>
      <!-- Search field
      <v-text-field
        flat
        solo
        solo-inverted
        hide-details
        prepend-inner-icon="mdi-magnify"
        label="Search"
        v-model="search_term"
        clearable
      ></v-text-field>
      -->
      <v-btn @click="dialog = true" :disabled="dialog" class="mx-2">
        <span class="d-none d-md-inline pr-2">
          Upload
        </span>
        <v-icon>
          mdi-cloud-upload
        </v-icon>
      </v-btn>
      <v-btn @click="log_out" class="mx-2">
        <span class="d-none d-md-inline pr-2">
          Logout
        </span>
        <v-icon>
          mdi-logout
        </v-icon>
      </v-btn>
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
        <v-row justify="space-around" v-if="files.length < 5">
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
import { SourcedContextualizedEvaluation } from "@/store/report_intake";
import ServerModule from "@/store/server";
import { isFromProfileFile } from "@/store/data_store";

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

  /** Yields the control pairings that have changed*/
  get delta_sets(): ControlSeries[] {
    return this.control_sets.filter(series => {
      // Get the first status. If no change, all should equal this
      let first = series[0].hdf.status;
      for (let i = 1; i < series.length; i++) {
        // Check if the status has changed. If so, keep
        if (series[i].hdf.status !== first) {
          return true;
        }
      }
      return false;
    });
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
    if (this.control_sets.length == 0) {
      return [];
    }
    var fileArr = [];
    let prof;
    for (let ctrl of this.control_sets[0]) {
      prof = ctrl.sourced_from;
      if (isFromProfileFile(prof)) {
        //fileArr.push(prof.from_file);
      } else {
        let evaluation = prof.sourced_from! as SourcedContextualizedEvaluation;
        fileArr.push(evaluation.from_file);
      }
    }
    //let data_store = getModule(InspecDataModule, this.$store);
    return fileArr;
  }

  log_out() {
    getModule(ServerModule, this.$store).clear_token();
    this.dialog;
    this.$router.push("/");
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
