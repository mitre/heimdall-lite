<template>
  <ApexPieChart
    :categories="categories"
    :series="series"
    v-on:category-selected="onSelect"
  />
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import ApexPieChart, { Category } from "@/components/generic/ApexPieChart.vue";
import { getModule } from "vuex-module-decorators";
import SeverityCountModule from "../../store/severity_counts";
import { Severity } from "inspecjs";

// We declare the props separately to make props types inferable.
const SeverityChartProps = Vue.extend({
  props: {
    filter: Object
  }
});

/**
 * Categories property must be of type Category
 * Emits "category-selected" with payload of type Category whenever a category is selected.
 */
@Component({
  components: {
    ApexPieChart
  }
})
export default class SeverityChart extends SeverityChartProps {
  categories: Category<Severity>[] = [
    // { label: "Low", value: "low", icon: "SquareIcon", color: "var(--v-success-base)" },
    { label: "Low", value: "low", icon: "SquareIcon", color: "severityLow" },
    {
      label: "Medium",
      value: "medium",
      icon: "SquareIcon",
      color: "severityMedium"
    },
    {
      label: "High",
      value: "high",
      icon: "SquareIcon",
      color: "severityHigh"
    },
    {
      label: "Critical",
      value: "critical",
      icon: "SquareIcon",
      color: "severityCritical"
    }
  ];

  get series(): number[] {
    let counts: SeverityCountModule = getModule(SeverityCountModule);
    return [
      counts.low(this.filter),
      counts.medium(this.filter),
      counts.high(this.filter),
      counts.critical(this.filter)
    ];
  }

  onSelect(impact: Category<Severity>) {
    this.$emit("filter-impact", impact.value);
  }
}
</script>
