<template>
  <canvas :id="uid" ref="chart_canvas" :fake_prop="_watch" />
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Chart } from "chart.js";
import ColorHackModule from "../../store/color_hack";
import { getModule } from "vuex-module-decorators";
import { Color } from "vuetify/lib/util/colors";

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

// Type guard for Category
function isCategory(x: any): x is Category<string> {
  return (
    typeof x.label === "string" &&
    typeof x.value === "string" &&
    typeof x.color === "string"
  );
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
    },
    arc_span: {
      type: Number,
      default: 360
    },
    doughnut: {
      type: Boolean,
      default: false
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
   * Provide a type-checked accessor to our categories propertyt
   */
  get _categories(): Category<string>[] {
    // Ensure it's an array
    if (!(this.categories instanceof Array)) {
      throw "categories must be an array of type Category";
    }

    // Ensure each are categories
    this.categories.forEach(element => {
      if (!isCategory(element)) {
        throw `Invalid category ${element}`;
      }
    });

    // Finally, return as known type
    return this.categories as Category<string>[];
  }

  /**
   * Provide a type-checked accessor to our series property
   */
  get _series(): number[] {
    // Ensure it's an array
    if (!(this.series instanceof Array)) {
      throw "series must be an array of numbers";
    }

    // Ensure all of its elements are numbers
    this.series.forEach(element => {
      if (typeof element !== "number") {
        throw `Invalid series item ${element}`;
      }
    });

    // We now know the type is definitely number[]
    let final = this.series as number[];

    // If we have any non-zero data, just returngive 0.01 of all
    return final;
  }

  /**
   * Typed access to our chart canvas ref
   */
  get chart_canvas(): Element {
    return this.$refs.chart_canvas as Element;
  }

  /**
   * Getter property being used as a watch property shim.
   * Unfortunately the Vue-class-component library has negligible support for watch properties.
   * Maybe look into the more advanced version...?
   */
  get _watch(): string {
    // Declare our dependencies -- specifically, color and data
    let deps: any = [this.$vuetify.theme.dark, this._series];

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
    let data: Chart.ChartData = {
      labels: this._categories.map(c => c.label),
      datasets: [
        {
          label: "Number of controls",
          backgroundColor: this._categories.map(c =>
            this.colors.lookupColor(c.color)
          ),
          data: this._series,
          // rotation: 0.5 * Math.PI,
          borderWidth: 1,
          hoverBorderWidth: 2,
          borderColor: "#888888",
          hoverBorderColor: this.colors.lookupColor("fgtext")
        }
      ]
    };
    return data;
  }

  /** Generates our chart options.
   * Changes to reflect colorscheme changes
   */
  get options(): Chart.ChartOptions {
    // Define our callbacks
    let on_series_click = (
      event: MouseEvent | undefined,
      activeElements: {}[] | undefined
    ) => {
      if (activeElements !== undefined && activeElements.length > 0) {
        // This isn't properly typed in the output, but we know there will always be an index
        let selected_index = (activeElements[0] as any)._index;
        this.$emit("category-selected", this._categories[selected_index]);
      }
    };
    let on_legend_click = (
      event: MouseEvent,
      legendItem: Chart.ChartLegendLabelItem
    ) => {
      let selected_index = legendItem.datasetIndex;
      this.$emit("category-selected", this._categories[selected_index]);
    };

    return {
      // Make the arc start from the left
      rotation: Math.PI,
      // Set the circumference, to allow half-donuts
      circumference: (this.arc_span / 180) * Math.PI,
      layout: {
        padding: {
          left: 20,
          right: 20,
          top: 10,
          bottom: 30
        }
      },
      // Enable the legend
      legend: {
        display: true, // Looks better false; investigate generating programatically
        // Tweak labels to look a bit nicer
        labels: {
          boxWidth: 12, // Make it square
          fontColor: this.colors.lookupColor("fgtext") // use fg color
        },
        onClick: on_legend_click
      },
      onClick: on_series_click
    };
  }

  /** on mount, configure chart */
  mounted() {
    // Get the color module
    let colors: ColorHackModule = getModule(ColorHackModule, this.$store);

    // Make our config
    let configuration: Chart.ChartConfiguration = {
      type: this.doughnut ? "doughnut" : "pie",
      data: this.chart_data,
      options: this.options
    };

    // Instantiate our chart
    this.chart = new Chart(this.uid, configuration);
  }
}
</script>
