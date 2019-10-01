<template>
  <canvas id="compliance_chart" :fake_prop="_watch" />
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Chart from "chart.js";
//@ts-ignore
require("chartjs-chart-radial-gauge");
import { getModule } from "vuex-module-decorators";
import ColorHackModule from "@/store/color_hack";
import FilteredDataModule, { Filter } from "@/store/data_filters";
import StatusCountModule from "@/store/status_counts";

// We declare the props separately
// to make props types inferrable.
const ComplianceChartProps = Vue.extend({
  props: {
    filter: Object // Of type Filer from filteredData
  }
});

@Component({})
export default class ComplianceChart extends ComplianceChartProps {
  /** The chart itself. Initially undefined */
  chart: Chart | undefined;

  /**
   * We actuall generate our series ourself! This is what shows up in the chart. It should be a single value
   */
  get compliance(): number {
    // Get access to the status counts, to compute compliance percentages
    let counts = getModule(StatusCountModule, this.$store);
    let passed = counts.passed(this.filter);
    let not_passed =
      counts.failed(this.filter) +
      counts.profileError(this.filter) +
      counts.notReviewed(this.filter);

    let total = passed + not_passed;
    if (total == 0) {
      return 0;
    } else {
      return Math.round((100.0 * passed) / total);
    }
  }

  /**
   * Getter property being used as a watch property shim.
   * Unfortunately the Vue-class-component library has negligible support for watch properties.
   * Maybe look into the more advanced version...?
   */
  get _watch(): string {
    // Declare our dependencies -- specifically, color and data
    let deps: any = [this.$vuetify.theme.dark, this.compliance];

    // Perform an update if chart exists
    if (this.chart !== undefined) {
      // Update the data
      this.chart.data.datasets![0].data = [this.compliance];

      // Update!
      this.chart.update();
    }
    // Vary our output on dependencies so this function will be reliably called
    return deps.join(";");
  }

  /** Provide quick access to our color lookup function */
  get colors(): ColorHackModule {
    return getModule(ColorHackModule, this.$store);
  }

  /** The gradient we use for everything else */
  get track_color(): Chart.ChartColor {
    return "#CCCCCC";
  }

  /** The gradient we use for filling the bar */
  get gradient(): CanvasGradient | undefined {
    if (this.chart !== undefined) {
      let gradientStroke = this.chart.ctx!.createLinearGradient(500, 0, 100, 0);
      gradientStroke.addColorStop(0, this.colors.lookupColor("statusFailed"));
      gradientStroke.addColorStop(1, this.colors.lookupColor("statusPassed"));
      return gradientStroke;
    } else {
      return undefined;
    }
  }

  /** Generates our chart data */
  get chart_dataset(): Chart.ChartDataSets {
    // Make the actual dataset
    let data_set: Chart.ChartDataSets = {
      backgroundColor: this.gradient,
      data: [this.compliance],
      borderColor: this.track_color
    };
    return data_set;
  }

  /** on mount, configure chart */
  mounted() {
    // Define our base chartjs options
    let base_options: Chart.ChartOptions = {
      // rotation: Math.PI,
      responsive: true,
      legend: {
        display: false
      }
    };

    // Define our radialguage options
    let full_options: any = Object.assign({}, base_options);
    Object.assign(full_options, {
      trackColor: this.track_color,
      showValue: true,
      centerArea: {
        text: function(value: any, options: Chart) {
          return value + "%";
        }
      }
    });

    // Make our config
    let configuration: Chart.ChartConfiguration = {
      type: "radialGauge",
      data: {
        labels: [
          "# Passed / (# Failed + # Not Reviewed + # Not Applicable) * 100%"
        ],
        datasets: [this.chart_dataset]
      },
      options: full_options
      // plugins: [RadialGuage]
    };

    // Instantiate our chart
    this.chart = new Chart("compliance_chart", configuration);
  }
}

// Chart.pluginService.unregister(ChartDataLabels);
</script>
