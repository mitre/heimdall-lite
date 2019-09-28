<template>
  <PieChart
    :categories="categories"
    :series="series"
    :doughnut="true"
    :arc_span="180"
  />
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import PieChart, { Category } from "@/components/generic/PieChart.vue";
import { getModule } from "vuex-module-decorators";
import ColorHackModule from "@/store/color_hack";
import FilteredDataModule, { Filter } from "@/store/data_filters";
import { ControlStatus, Severity } from "inspecjs";
import InspecDataModule from "@/store/data_store";
import StatusCountModule from "@/store/status_counts";

// We declare the props separately
// to make props types inferrable.
const ComplianceChartProps = Vue.extend({
  props: {
    filter: Object // Of type Filer from filteredData
  }
});

/**
 * Categories property must be of type Category
 * Model is of type Severity | null - reflects selected severity
 */
@Component({
  components: {
    PieChart
  }
})
export default class ComplianceChart extends ComplianceChartProps {
  /**
   * We actuall generate our series ourself! This is what shows up in the chart. It should be a single value
   */
  get series(): number[] {
    // Get access to the status counts, to compute compliance percentages
    let counts = getModule(StatusCountModule, this.$store);
    let passed = counts.passed(this.filter);
    let failed = counts.failed(this.filter) + counts.profileError(this.filter);
    let not_reviewed = counts.notReviewed(this.filter);

    let total = passed + failed + not_reviewed;
    if (total == 0) {
      return [0, 0];
    } else {
      return [passed / total, not_reviewed / total, failed / total].map(x =>
        Math.round(100.0 * x)
      );
    }
  }

  categories: Category<string>[] = [
    {
      label: "Passed %",
      value: "n/a",
      color: "statusPassed"
    },
    {
      label: "Not Reviewed %",
      value: "n/a",
      color: "statusNotReviewed"
    },
    {
      label: "Failed + Errored %",
      value: "n/a",
      color: "statusFailed"
    }
  ];
}
</script>
