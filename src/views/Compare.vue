<template>
  <BaseView v-resize:debounce="on_resize">
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
          <v-col cols="12">
            <div style="position:relative; top:14px;">
              <h1>
                Results Comparisons
              </h1>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-card class="fill-height">
              <v-tabs fixed-tabs v-model="tab">
                <v-tab key="status"> Status by Results File </v-tab>
                <v-tab key="compliance"> % Compliance </v-tab>
                <v-tab key="severity"> Failed Tests by Severity </v-tab>
              </v-tabs>
              <transition>
                <keep-alive>
                  <v-col v-if="tab == 0" cols="12">
                    <v-row>
                      <v-sheet class="mx-auto" elevation="8" max-width="100%">
                        <v-slide-group :show-arrows="true">
                          <v-slide-item v-for="(file, i) in files" :key="i">
                            <v-card class="fill-height">
                              <v-card-title class="justify-center">
                                <div style="text-align:center;">
                                  <i>{{ i + 1 }}</i> <br />
                                  {{ file.filename }}
                                </div>
                              </v-card-title>
                              <v-card-actions class="justify-center">
                                <StatusChart
                                  :filter="{ fromFile: [file.unique_id] }"
                                  :value="null"
                                  :show_compliance="true"
                                />
                              </v-card-actions>
                            </v-card>
                          </v-slide-item>
                        </v-slide-group>
                      </v-sheet>
                    </v-row>
                  </v-col>
                  <v-col v-else-if="tab == 1" cols="12">
                    <ApexLineChart
                      :series="compliance_series"
                      :categories="fileTimes"
                      :upper_range="100"
                      :title="'Total Compliance'"
                      :y_title="'% Compliance'"
                    ></ApexLineChart>
                  </v-col>
                  <v-col v-else cols="12">
                    <ApexLineChart
                      :series="line_sev_series"
                      :categories="fileTimes"
                      :upper_range="total_failed + 1"
                      :sev_chart="true"
                      :title="'Failed Tests by Severity'"
                      :y_title="'Tests Failed'"
                    ></ApexLineChart>
                  </v-col>
                </keep-alive>
              </transition>
            </v-card>
          </v-col>
        </v-row>
        <v-card>
          <v-row>
            <v-col cols="5">
              <v-card-title>Test Results</v-card-title>
            </v-col>
            <v-col cols="3" xs="3" sm="3" md="4" lg="4" xl="4"> </v-col>
            <v-col cols="4" xs="4" sm="4" md="3" lg="3" xl="3">
              <v-checkbox
                color="blue"
                v-model="checkbox"
                :label="'Display Only Changed Results'"
              ></v-checkbox>
            </v-col>
          </v-row>
          <hr />
          <v-row>
            <v-col cols="3" xs="3" sm="2" md="2" lg="1" xl="1">
              <div style="text-align: center;"><strong>Test ID</strong></div>
              <v-btn icon small style="float: right;">
                <v-icon
                  v-if="files.length > num_shown_files"
                  @click="scroll_left"
                  :disabled="start_index == 0"
                >
                  mdi-arrow-left
                </v-icon>
              </v-btn>
            </v-col>
            <ProfileRow
              v-for="i in num_shown_files"
              :key="i - 1 + start_index"
              :name="files[i - 1 + start_index].filename"
              :start_time="fileTimes[i]"
              :index="i + start_index"
              :show_index="files.length > num_shown_files"
            />
            <v-col cols="1">
              <p></p>
              <v-btn icon small>
                <v-icon
                  v-if="files.length > num_shown_files"
                  @click="scroll_right"
                  :disabled="start_index >= files.length - num_shown_files"
                >
                  mdi-arrow-right
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <CompareRow
            v-for="(control_set, i) in show_set"
            :controls="control_set"
            :shown_files="num_shown_files"
            class="my-4"
            :key="i"
            :shift="start_index"
          />
        </v-card>
      </v-container>
    </template>

    <!-- File select modal -->
    <UploadNexus v-model="dialog" @got-files="on_got_files" />
  </BaseView>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import BaseView from "@/views/BaseView.vue";
import Modal from "@/components/global/Modal.vue";
import UploadNexus from "@/components/global/UploadNexus.vue";
import CompareRow from "@/components/cards/comparison/CompareRow.vue";

import FilteredDataModule, { Filter } from "@/store/data_filters";
import { ControlStatus, Severity, context } from "inspecjs";
import SeverityCountModule from "@/store/severity_counts";
import { FileID } from "@/store/report_intake";
import {
  ComparisonContext,
  ControlDelta,
  ControlSeries
} from "../utilities/delta_util";
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
import ApexLineChart, {
  SeriesItem
} from "@/components/generic/ApexLineChart.vue";
//@ts-ignore
import resize from "vue-resize-directive";

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
    ProfileRow,
    StatusChart,
    ApexLineChart
  },
  directives: {
    resize
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

  /** Whether or not the model is showing */
  dialog: boolean = false;
  checkbox: boolean = false;
  tab: number = 0;
  width: number = window.innerWidth;
  start_index: number = 0;

  /** Yields the current two selected reports as an ExecDelta,  */
  get curr_delta(): ComparisonContext {
    let filter_store = getModule(FilteredDataModule, this.$store);
    let selected_data = filter_store.evaluations(
      filter_store.selected_file_ids
    );
    return new ComparisonContext(selected_data);
  }

  /** Yields the control pairings in a more easily consumable list form */
  get control_sets(): ControlSeries[] {
    return Object.values(this.curr_delta.pairings);
  }

  /** Yields the control pairings that have changed*/
  get delta_sets(): ControlSeries[] {
    function get_status_safe(ctrl: null | context.ContextualizedControl) {
      if (ctrl == null) {
        return "No Data";
      }
      return ctrl.hdf.status;
    }
    return this.control_sets.filter(series => {
      // Get the first status. If no change, all should equal this
      let first = get_status_safe(series[0]);
      for (let i = 1; i < series.length; i++) {
        // Check if the status has changed. If so, keep
        if (get_status_safe(series[i]) !== first) {
          return true;
        }
      }
      return false;
    });
  }

  get profile_diff(): boolean {
    let data_store = getModule(InspecDataModule, this.$store);
    let filtered_module = getModule(FilteredDataModule, this.$store);
    let file_ids = [];
    for (let file of this.files) {
      file_ids.push(file.unique_id);
    }
    let profiles = filtered_module.profiles(file_ids);
    for (let i = 0; i < profiles.length - 1; i++) {
      if (profiles[i].data.name != profiles[i + 1].data.name) {
        return true;
      }
    }
    return false;
  }

  get show_set(): ControlSeries[] {
    if (this.checkbox) {
      return this.delta_sets;
    }
    return this.control_sets;
  }

  get statusCols(): number {
    if (this.width < 600) {
      return 12;
    }
    return Math.floor(12 / this.files.length);
  }

  get files(): EvaluationFile[] {
    let filter_module = getModule(FilteredDataModule, this.$store);
    let fileArr = [];
    let fileList = filter_module.evaluations(filter_module.selected_file_ids);
    for (let i = 0; i < fileList.length; i++) {
      fileArr.push(fileList[i].from_file);
    }

    fileArr = fileArr.sort((a, b) => {
      let a_date = new Date(
        filter_module.controls({ fromFile: [a.unique_id] })[0].root.hdf
          .start_time || 0
      );
      let b_date = new Date(
        filter_module.controls({ fromFile: [b.unique_id] })[0].root.hdf
          .start_time || 0
      );
      return a_date.valueOf() - b_date.valueOf();
    });
    return fileArr;
  }

  get sev_series(): number[][] {
    var series = [];
    var lowCounts = [];
    var medCounts = [];
    var highCounts = [];
    var critCounts = [];
    let totalSevCounts: SeverityCountModule = getModule(
      SeverityCountModule,
      this.$store
    );
    for (let file of this.files) {
      lowCounts.push(
        totalSevCounts.low({ fromFile: [file.unique_id], status: "Failed" })
      );
      medCounts.push(
        totalSevCounts.medium({ fromFile: [file.unique_id], status: "Failed" })
      );
      highCounts.push(
        totalSevCounts.high({ fromFile: [file.unique_id], status: "Failed" })
      );
      critCounts.push(
        totalSevCounts.critical({
          fromFile: [file.unique_id],
          status: "Failed"
        })
      );
    }
    series.push(lowCounts);
    series.push(medCounts);
    series.push(highCounts);
    series.push(critCounts);
    return series;
  }

  get line_sev_series(): SeriesItem[] {
    var series = [];
    var low = { name: "Failed Low Severity", data: this.sev_series[0] };
    var med = { name: "Failed Medium Severity", data: this.sev_series[1] };
    var high = { name: "Failed High Severity", data: this.sev_series[2] };
    var crit = { name: "Failed Critical Severity", data: this.sev_series[3] };
    series.push(low);
    series.push(med);
    series.push(high);
    series.push(crit);
    return series;
  }

  get compliance_series(): SeriesItem[] {
    var series = [];
    for (let file of this.files) {
      let filter = { fromFile: [file.unique_id] };
      let counts = getModule(StatusCountModule, this.$store);
      let passed = counts.passed(filter);
      let total =
        passed +
        counts.failed(filter) +
        counts.profileError(filter) +
        counts.notReviewed(filter);
      if (total == 0) {
        series.push(0);
      } else {
        series.push(Math.round((100.0 * passed) / total));
      }
    }
    return [{ name: "Compliance", data: series }];
  }

  get fileTimes(): (string | undefined)[] {
    let data_store = getModule(FilteredDataModule, this.$store);
    var names = [];
    for (let file of this.files) {
      let time = data_store.controls({ fromFile: [file.unique_id] })[0].root.hdf
        .start_time;
      names.push(time);
    }
    return names;
  }

  get total_failed(): number {
    if (this.files.length < 1) {
      return 0;
    }
    let highest_failed = 0;
    let counts = getModule(StatusCountModule, this.$store);
    for (let file of this.files) {
      let filter = { fromFile: [file.unique_id] };
      let failed = counts.failed(filter);
      if (failed > highest_failed) {
        highest_failed = failed;
      }
    }
    return highest_failed;
  }

  get num_shown_files(): number {
    if (this.width < 600) {
      if (this.files.length > 2) {
        return 2;
      }
      return this.files.length;
    } else if (this.width < 960) {
      if (this.files.length > 3) {
        return 3;
      }
    } else if (this.width < 1264) {
      if (this.files.length > 4) {
        return 4;
      }
      return this.files.length;
    } else if (this.files.length > 10) {
      return 10;
    }
    return this.files.length;
  }

  log_out() {
    getModule(ServerModule, this.$store).clear_token();
    this.dialog;
    this.$router.push("/");
  }

  on_resize(elt: any) {
    if (this.start_index > this.files.length - this.num_shown_files) {
      this.start_index = this.files.length - this.num_shown_files;
    }
    if (elt.clientWidth !== undefined && elt.clientWidth > 1) {
      this.width = elt.clientWidth - 24;
    }
  }

  scroll_left() {
    this.start_index += -1;
    console.log(this.start_index);
  }

  scroll_right() {
    this.start_index += 1;
    console.log(this.start_index);
  }

  on_got_files(ids: FileID[]) {
    // Close the dialog
    this.dialog = false;

    //enable all uploaded files
    let filter_module = getModule(FilteredDataModule, this.$store);
    for (let i of ids) {
      filter_module.set_toggle_file_on(i);
    }
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
