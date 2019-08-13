<template>
  <div slot="no-body">
    <vue-apex-charts
      id="chart"
      type="radialBar"
      height="300"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import VueApexCharts from "vue-apexcharts";
import { getModule } from "vuex-module-decorators";
import ColorHackModule from "../../store/color_hack";
import { Filter } from "@/store/data_filters";
import { ControlStatus, Severity } from "inspecjs";
import { ApexOptions } from "apexcharts";

// We declare the props separately
// to make props types inferrable.
const ComplianceChartProps = Vue.extend({
  props: {
    totalTests: Number,
    passedTests: Number
  }
});

@Component({
  components: {
    VueApexCharts
  }
})
export default class ComplianceChart extends ComplianceChartProps {
  get chartOptions(): ApexOptions {
    // Get our color module
    let colors = getModule(ColorHackModule, this.$store);

    // Produce our options
    let result: ApexOptions = {
      plotOptions: {
        radialBar: {
          startAngle: -150,
          endAngle: 150,
          hollow: {
            size: "70%"
          },
          track: {
            opacity: 0
          },
          dataLabels: {
            show: true,
            value: {
              color: "#99a2ac",
              fontSize: "2rem"
            }
          }
        }
      },
      fill: {
        type: "solid",
        colors: [
          function(data: { value: number }) {
            if (data.value < 60) {
              return colors.lookupColor("complianceLow");
            } else if (data.value >= 60 && data.value < 90) {
              return colors.lookupColor("complianceMedium");
            } else {
              return colors.lookupColor("complianceHigh");
            }
          }
        ]
      },
      chart: {
        dropShadow: {
          enabled: true,
          top: 0,
          left: 0,
          blur: 3,
          opacity: 0.35
        }
      },
      stroke: {
        dashArray: 8
      },
      labels: ["Compliance Level"]
    };
    return result;
  }

  /**
   * Provide a type-checked accessor to our series property
   */
  get series(): number[] {
    return [100];
  }
}
</script>

<!--
<style scoped>
.card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-grow: 1;
  height: 107%; /*ehhh*/
}
</style>
-->
