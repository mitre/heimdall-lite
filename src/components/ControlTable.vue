<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :search="search"
    :single-expand="singleExpand"
    :expanded.sync="expanded"
    item-key="vuln_num"
    show-expand
    class="my-4 px-4"
  >
    <template v-slot:item.status="{ item }">
      <v-chip :color="getColor(item.status)" :label="true" class="wset">
        {{ item.status }}
      </v-chip>
    </template>
    <template v-slot:item.nist_tags="{ item }">
      {{ getNist(item.nist_tags) }}
    </template>

    <template v-slot:top>
      <v-toolbar flat>
        <v-text-field
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
        <v-spacer></v-spacer>
        <v-switch
          v-model="singleExpand"
          label="Single expand"
          class="mt-2"
        ></v-switch>
      </v-toolbar>
    </template>
    <template v-slot:expanded-item="{ headers, item }">
      <td :colspan="headers.length">
        <v-tabs>
          <v-tab>Test Details</v-tab>
          <v-tab-item>
            <div class="newline">
              <span>{{ item.finding_details.split(":")[0] }}:</span>
              <br />
              <br />
              <span>{{ item.wraps.desc }}</span>
            </div>
            <br />
            <table border="3px solid white" rule="rows">
              <tr v-for="(result, index) in item.wraps.results" :key="index">
                <td>{{ result.status.toUpperCase() }}</td>
                <td>
                  <prism language="ruby">Test: {{ result.code_desc }}</prism>
                </td>
                <td v-if="result.message">
                  <prism language="ruby">Message: {{ result.message }}</prism>
                </td>
              </tr>
            </table>
          </v-tab-item>

          <v-tab>Details</v-tab>
          <v-tab-item>
            <table>
              <tr>
                <td>Control:</td>
                <td>{{ item.wraps.id }}</td>
              </tr>
              <tr>
                <td>Title:</td>
                <td>{{ item.wraps.title }}</td>
              </tr>
              <tr>
                <td>Desc:</td>
                <td>{{ item.wraps.desc }}</td>
              </tr>
              <tr>
                <td>Severity:</td>
                <td>{{ item.severity }}</td>
              </tr>
              <tr>
                <td>Impact:</td>
                <td>{{ item.wraps.impact }}</td>
              </tr>
              <tr>
                <td>Nist Ref:</td>
                <td>{{ getNist(item.nist_tags) }}</td>
              </tr>
              <tr>
                <td>Check Text:</td>
                <td class="newline">{{ item.wraps.tags.check }}</td>
              </tr>
              <tr>
                <td>Fix Text:</td>
                <td class="newline">{{ item.wraps.tags.fix }}</td>
              </tr>
            </table>
          </v-tab-item>

          <v-tab>Inspec Code</v-tab>
          <v-tab-item>
            <prism language="ruby">{{ item.wraps.code }}</prism>
          </v-tab-item>
        </v-tabs>
      </td>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { hdfWrapControl, HDFControl } from "inspecjs";

//highlighting component -- TODO: add line numbers
import "prismjs/prism";
import "prismjs/themes/prism-coy.css";
import "prismjs/components/prism-ruby";
const Prism = require("vue-prism-component");

interface Header {
  text: string;
  value: string;
  align?: "left" | "right"; // TODO: Find more
  sortable?: boolean;
}
// We declare the props separately to make props types inferable.
const ControlTableProps = Vue.extend({
  props: {}
});

@Component({
  components: { Prism }
})
export default class ControlTable extends ControlTableProps {
  get items() {
    var arr = this.$store.getters["data/contextualControls"].map(
      (item: any) => {
        return item.data;
      }
    );
    for (var i = 0; i < arr.length; i++) arr[i] = hdfWrapControl(arr[i]);
    return arr;
  }
  getColor(def: string) {
    var color = null;
    switch (def) {
      case "Passed":
        color = "#0f0";
        break;
      case "Failed":
        color = "#f00";
        break;
      case "Not Applicable":
        color = "#00f";
        break;
      case "Not Reviewed":
        color = "#888";
        break;
      case "Profile Error":
        color = "#000";
        break;
    }
    return color;
  }
  getNist(nist: any) {
    return nist.join(", ");
  }
  expanded: any[] = [];
  search: string = "";
  singleExpand: boolean = false;
  var: boolean = false;
  headers: Header[] = [
    {
      text: "Status",
      align: "left",
      value: "status"
    },
    { text: "Title", value: "wraps.title" },
    { text: "Control ID", value: "vuln_num" },
    { text: "Severity", value: "severity" },
    { text: "NIST SP 800-53", value: "nist_tags" }
  ];
}
</script>

<style>
.newline {
  white-space: pre;
}
.wset {
  min-width: 125px;
  justify-content: center;
}
</style>
