<template>
  <canvas :id="uid" ref="chart_canvas" :fake_prop="_watch" />
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Chart } from "chart.js";
import ColorHackModule from "../../store/color_hack";
import { getModule } from "vuex-module-decorators";

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

const PieChartProps = Vue.extend({
  props: {
    categories: Array, // Should be of type Category[]
    series: Array, // Should be of type number[]
    arc_span: {
      type: Number,
      default: 360
    }
  }
});

@Component({})
export default class PieChart extends PieChartProps {
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
    if (this.chart !== undefined) {
      this.chart.data.datasets![0].data = this._series;
      this.chart.update();
    }
    // Vary our output on this._series so this function will be reliably called
    return this._series.join(";");
  }

  mounted() {
    // Get the color module
    let colors: ColorHackModule = getModule(ColorHackModule, this.$store);

    // Instantiate our chart
    this.chart = new Chart(this.uid, {
      type: "doughnut",
      data: {
        labels: this._categories.map(c => c.label),
        datasets: [
          {
            label: "Number of controls",
            backgroundColor: this._categories.map(c =>
              colors.lookupColor(c.color)
            ),
            data: this._series,
            // rotation: 0.5 * Math.PI,
            borderWidth: 0,
            hoverBorderWidth: 2
          }
        ]
      },
      options: {
        rotation: Math.PI,
        circumference: (this.arc_span / 180) * Math.PI,
        legend: {
          display: true // Looks better false; investigate generating programatically
        },
        onClick: (
          event: MouseEvent | undefined,
          activeElements: {}[] | undefined
        ) => {
          if (activeElements !== undefined && activeElements.length > 0) {
            // This isn't properly typed in the output, but we know there will always be an index
            let selected_index = (activeElements[0] as any)._index;
            this.$emit("category-selected", this._categories[selected_index]);
          }
        }
      }
    });
  }
}
</script>
