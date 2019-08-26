// CommitChart.ts
import Vue from "vue";
import { Pie, mixins } from "vue-chartjs";
import Component from "vue-class-component";

const PieChartProps = Vue.extend({
  props: {
    categories: Array, // Should be of type Category[]
    series: Array // Should be of type number[]
  }
});

@Component({
  extends: Pie, // this is important to add the functionality to your component
  mixins: [mixins.reactiveProp]
})
export default class CommitChart extends Vue<Pie> {
  //export default class CommitChart extends PieChartProps {
  mounted() {
    // Overwriting base render method with actual data.
    this.renderChart({
      labels: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ],
      datasets: [
        {
          label: "GitHub Commits",
          backgroundColor: "#f87979",
          data: [40, 20, 12, 39, 10, 40, 39, 80, 40, 20, 12, 11]
        }
      ]
    });
  }
}
