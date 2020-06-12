<template>
  <div class="line-chart">
    <vue-apex-charts
      type="line"
      height="350"
      :options="chartOptions"
      :series="_series"
    ></vue-apex-charts>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import VueApexCharts from "vue-apexcharts";
import { ApexOptions, exec } from "apexcharts";
import { install } from "vuetify/es5/install";
import { getModule } from "vuex-module-decorators";
import ColorHackModule from "@/store/color_hack";

// We declare the props separately to make props types inferable.
const ApexLineChartProps = Vue.extend({
  props: {
    categories: Array, // Should be of type string[]
    series: Array, // Should be of type object[]
    upper_range: Number, //upper bound of y axis
    sev_chart: Boolean, //identifies chart as severity chart
    title: String,
    y_title: String
  }
});

let id_counter = 0;
function next_id(): number {
  id_counter += 1;
  return id_counter;
}

export interface SeriesItem {
  name: string;
  data: number[];
}

/**
 * Emits "category-selected" with payload of type Category whenever a category is selected.
 */
@Component({
  components: {
    VueApexCharts
  }
})
export default class ApexLineChart extends ApexLineChartProps {
  chart_id: string = `line_chart_${next_id}`;

  get _categories(): string[] {
    // Ensure it's an array
    if (!(this.categories instanceof Array)) {
      throw new Error("series must be an array of strings");
    }

    // Ensure all of its elements are numbers
    this.categories.forEach(element => {
      if (typeof element !== "string") {
        throw new Error(`Invalid series item ${element}`);
      }
    });

    // We now know the type is definitely number[]
    let final = this.categories as string[];

    // If we have any non-zero data, just returngive 0.01 of all
    return final;
  }

  /**
   * Provide a type-checked accessor to our series property
   */
  get _series(): SeriesItem[] {
    // Ensure it's an array
    if (!(this.series instanceof Array)) {
      throw new Error("series must be an array of objects");
    }

    // Ensure all of its elements are numbers
    for (let element of this.series) {
      if (typeof element !== "object") {
        throw new Error(`Invalid series item ${element}`);
      }
    }

    // We now know the type is definitely number[]
    let final = this.series as SeriesItem[];

    // If we have any non-zero data, just returngive 0.01 of all
    return final;
  }

  get label_colors(): string[] {
    let colors = [];
    for (let i = 0; i < this._categories.length; i++) {
      colors.push("#FFFFFF");
    }
    return colors;
  }

  get y_axis_tick(): number {
    if (this.upper_range < 15) {
      return this.upper_range;
    } else {
      return Math.floor(this.upper_range / 10);
    }
  }

  get sev_colors(): string[] {
    let colors = [];
    colors.push("#FFEB3B");
    colors.push("#FF9800");
    colors.push("#FF5722");
    colors.push("#F44336");
    return colors;
  }

  get line_colors(): string[] | undefined {
    let colors = [];
    if (this.sev_chart) {
      return this.sev_colors;
    }
    return undefined;
  }

  get white_black(): string {
    var whiteBlack;
    if (this.$vuetify.theme.dark) {
      return "#FFFFFF";
    }
    return "#000000";
  }

  // Generate the chart options based on _categories
  get chartOptions(): ApexOptions {
    // Apex charts does not support color names; must use color hack module
    let colors = getModule(ColorHackModule, this.$store);

    return {
      chart: {
        height: 350,
        type: "line",
        zoom: {
          enabled: false
        }
      },
      colors: this.line_colors,
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 5,
        curve: "straight"
      },
      title: {
        text: this.title,
        align: "left",
        style: {
          fontFamily: "Arial Black",
          fontSize: "14px",
          color: this.white_black
        }
      },
      legend: {
        //tooltipHoverFormatter: function(val, opts) {
        //  return val + ' - ' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + ''
        //},
        labels: {
          useSeriesColors: true
        }
      },
      xaxis: {
        categories: this._categories,
        labels: {
          style: {
            colors: this.label_colors
          }
        }
      },
      yaxis: {
        min: 0,
        max: this.upper_range,
        tickAmount: this.y_axis_tick,
        axisTicks: {
          color: "#FF0000"
        },
        axisBorder: {
          show: true,
          color: this.white_black,
          offsetX: 0,
          offsetY: 0
        },
        title: {
          text: this.y_title,
          style: {
            color: this.white_black
          }
        },
        labels: {
          style: {
            color: this.white_black
          }
        }
      },
      grid: {
        borderColor: "#f1f1f1"
      }
    };
  }
}
</script>

<style scoped>
.line-chart {
  color: "#000000";
  font-size: 40px;
}

svg {
  fill: currentColor;
}
</style>
