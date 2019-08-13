<template>
  <v-container fluid grid-list-md pa-5>
    <!-- Count Cards -->
    <StatusCardRow />

    <!-- Compliance Cards -->
    <v-row justify="space-around">
      <v-col xs-4>
        <v-card>
          <v-card-title>Status Counts</v-card-title>
          <v-card-text><StatusChart :filter="{}"/></v-card-text>
        </v-card>
      </v-col>
      <v-col xs-4>
        <v-card>
          <v-card-title>Severity Counts</v-card-title>
          <v-card-text><SeverityChart :filter="{}"/></v-card-text>
        </v-card>
      </v-col>
      <v-col xs-4>
        <v-card>
          <v-card-title class="fill-height">Compliance Level</v-card-title>
          <v-card-text>
            <ComplianceChart :filter="{}" />
            [Passed/(Passed + Failed + Not Reviewed + Profile Error) * 100]
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- TreeMap and Partition Map -->
    <v-sheet class="my-4 px-4" elevation="2" title="test">
      <h2>TreeMap and Others</h2>
    </v-sheet>

    <!-- DataTable -->
    <v-sheet class="my-4 px-4" elevation="2">
      <h2>Results View Data</h2>
      <ControlTable />
    </v-sheet>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import StatusCardRow from "@/components/cards/StatusCardRow.vue";
import TreeMap from "@/components/TreeMap.vue";
import ControlTable from "@/components/ControlTable.vue";
import StatusChart from "@/components/cards/StatusChart.vue";
import SeverityChart from "@/components/cards/SeverityChart.vue";
import ComplianceChart from "@/components/cards/ComplianceChart.vue";
import { Filter } from "../store/data_filters";
import { ControlStatus, Severity } from "inspecjs";

// We declare the props separately
// to make props types inferrable.
const ResultsProps = Vue.extend({
  props: {}
});

@Component({
  components: {
    StatusCardRow,
    TreeMap,
    ControlTable,
    StatusChart,
    SeverityChart,
    ComplianceChart
  }
})
export default class Results extends ResultsProps {
  // Stores the current filter
  filter: Filter = {};

  setSeverityFilter(newSeverity: Severity): void {
    // If they've picked the same one, we reset to undefined.
    // Otherwise, we set it as the new filter
    if (newSeverity === this.filter.severity) {
      this.filter.severity = undefined;
    } else {
      this.filter.severity = newSeverity;
    }
  }

  setStatusFilter(newStatus: ControlStatus): void {
    // If they've picked the same one, we reset to undefined.
    // Otherwise, we set it as the new filter
    if (newStatus === this.filter.status) {
      this.filter.status = undefined;
    } else {
      this.filter.status = newStatus;
    }
  }
}
</script>
