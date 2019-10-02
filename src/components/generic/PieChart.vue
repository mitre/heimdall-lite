<template>
  <canvas :id="uid" :fake_prop="_watch" />
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Chart from "chart.js";
import ChartDataLabels, { Context } from "chartjs-plugin-datalabels";
import ColorHackModule from "@/store/color_hack";
import { getModule } from "vuex-module-decorators";
import { Color } from "vuetify/lib/util/colors";
import { Options as LabelOptions } from "chartjs-plugin-datalabels/types/options";

// Chart UID generation
let uid = 0;
function gen_uid(): number {
  uid += 1;
  return uid;
}

// Represents a slice of the pie.
export interface Category<C extends string> {
  label: string;
  value: C;
  color: string;
}

const Props = Vue.extend({
  props: {
    categories: {
      type: Array, // Should be of type Category[]
      required: true
    },
    series: {
      type: Array, // Should be of type number[]
      required: true
    }
  }
});

@Component({})
export default class PieChart extends Props {
  /** The ID for the chart */
  uid: string = `piechart-${gen_uid()}`;

  /** The chart itself. Initially undefined */
  chart: Chart | undefined;

  /**
   * Provide a typed accessor to our categories property
   */
  get _categories(): Category<string>[] {
    // Return as known type
    return this.categories as Category<string>[];
  }

  /**
   * Provide a typed accessor to our series property
   */
  get _series(): number[] {
    // If we have any non-zero data, just returngive 0.01 of all
    return this.series as number[];
  }

  /**
   * Getter property being used as a watch property shim.
   * Unfortunately the Vue-class-component library has negligible support for watch properties.
   * Maybe look into the more advanced version...?
   */
  get _watch(): string {
    // Declare our dependencies -- specifically, color and data
    let deps: any = [this.options, this._series];

    // Perform an update if chart exists
    if (this.chart !== undefined) {
      // Update the data
      this.chart.data.datasets![0].data = this._series;

      // Update the legend colors
      this.chart.options = this.options;

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

  /** Generates our chart data */
  get chart_data(): Chart.ChartData {
    // Make the actual dataset
    let data_set: Chart.ChartDataSets = {
      backgroundColor: this._categories.map(c =>
        this.colors.lookupColor(c.color)
      ),
      data: this._series,
      // rotation: 0.5 * Math.PI,
      borderWidth: 1,
      hoverBorderWidth: 2,
      borderColor: "#CCCCCC",
      hoverBorderColor: this.colors.lookupColor("fgtext"),
      datalabels: {
        anchor: "end"
      }
    };

    let labels = this._categories.map(c => c.label);

    let data: Chart.ChartData = {
      labels: this._categories.map(c => c.label),
      datasets: [data_set]
    };
    return data;
  }

  /**
   * Generates annotation config options
   * See: https://chartjs-plugin-datalabels.netlify.com/guide/options.html#option-context
   */
  get data_labels(): LabelOptions {
    let opts: LabelOptions = {
      backgroundColor: function(context: Context) {
        return context.dataset.backgroundColor as string;
      },
      borderColor: this.colors.lookupColor("fgtext"),
      borderRadius: 25,
      borderWidth: 2,
      color: "black",
      display: function(context: Context) {
        let dataset = context.dataset!;
        let value = dataset.data![context.dataIndex]!;
        return value.valueOf() > 0;
      },
      font: {
        weight: "bold"
      }
    };
    return opts;
  }

  /** Generates our chart options.
   * Changes to reflect colorscheme changes
   */
  get options(): Chart.ChartOptions {
    // Define our callbacks
    let on_index_click = (index: number) =>
      this.$emit("category-selected", this._categories[index]);
    let on_series_click = (
      event: MouseEvent | undefined,
      activeElements: {}[] | undefined
    ) => {
      if (activeElements !== undefined && activeElements.length > 0) {
        // This isn't properly typed in the output, but we know there will always be an index
        let selected_index = (activeElements[0] as any)._index;
        on_index_click(selected_index);
      }
    };
    let on_legend_click = (
      event: MouseEvent,
      legendItem: Chart.ChartLegendLabelItem
    ) => {
      let selected_index = (legendItem as any).index;
      on_index_click(selected_index);
    };

    return {
      // Make the arc start from the left
      rotation: Math.PI,
      // Set the circumference, to allow half-donuts
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
        }
      },
      // Enable the legend
      legend: {
        display: true,
        // Tweak labels to look a bit nicer
        labels: {
          boxWidth: 12, // Make it square
          fontColor: this.colors.lookupColor("fgtext") // use fg color
        },
        onClick: on_legend_click,
        position: "left"
      },
      onClick: on_series_click, // Handle series clicks
      plugins: {
        datalabels: this.data_labels
      }
    };
  }

  /** on mount, configure chart */
  mounted() {
    // Make our config
    let configuration: Chart.ChartConfiguration = {
      type: "doughnut",
      data: this.chart_data,
      options: this.options,
      plugins: [ChartDataLabels]
    };

    // Instantiate our chart
    this.chart = new Chart(this.uid, configuration);
  }
}

Chart.pluginService.unregister(ChartDataLabels);
</script>
