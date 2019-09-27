<template>
  <div class="caat-btn-container">
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn v-on:click="exportCaat" v-on="on"
          ><v-icon>mdi-download</v-icon>
          <div class="button-txt">CAAT Spreadsheet Data</div></v-btn
        >
      </template>
      <span>Compliance Assessment Audit Tracking Data</span>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import FilteredDataModule from "../../store/data_filters";
import XLSX from "xlsx";
import { saveAs } from "file-saver";
import DataModule, { Filter, SearchTerm } from "../../store/data_store.ts";
import Store from "../../store/store.ts";
import { hdfWrapControl, HDFControl, ControlStatus } from "inspecjs";

export default {
  data() {
    return {
      hover: false
    };
  },
  methods: {
    exportCaat: function(event) {
      event.preventDefault();
      var filter: Filter = {};
      var caat = [];
      var vulnList = [];
      var controls = getModule(FilteredDataModule, this.$store).controls(
        filter
      );
      for (var ind in controls) {
        var control = controls[ind];
        var field = [];
        var family = "UM-1";
        if (control.nist) {
          var fam_str = control.nist[0].split(" ")[0];
          var parts = fam_str.split("-");
          family = parts[0] + "-";
          if (parts[1].length == 1) family += "0";
          family += parts[1];
        }
        if (
          control.impact != "none" &&
          !vulnList.includes(control.data.tags.gid)
        ) {
          vulnList.push(control.data.tags.gid);
          field.push(control.data.id); // Control Number
          field.push(this.br2nl(control.data.title)); // Finding Title
          field.push(this.convertDate(new Date(control.start_time), "/")); // Date Identified
          field.push(control.data.tags.stig_id); // Finding ID
          field.push(""); // Information System or Program Name
          field.push(""); // Repeat Findings
          field.push(""); // Repeat Finding CFACTS Weakness ID
          field.push(this.br2nl(control.data.title)); // Finding Description
          field.push(this.br2nl(control.data.desc)); // Weakness Description
          field.push("Security"); // Control Weakness Type
          field.push("Self-Assessment "); // Source
          field.push("InSpec"); // Assessment/Audit Company
          field.push("Test"); // Test Method
          field.push(this.br2nl(control.data.tags.check)); // Test Objective
          field.push(this.br2nl(control.data.results[0].message)); // Test Result Description
          var result =
            control.data.status == "Passed"
              ? "Satisfied"
              : "Other Than Satisfied";
          field.push(result); // Test Result
          field.push(this.br2nl(control.data.tags.fix)); // Recommended Corrective Action(s)
          field.push(""); // Effect on Business
          field.push(""); // Likelihood
          field.push(control.data.impact); // Impact
          caat.push(field);
        }
      }
      caat = caat.sort(this.Comparator);
      caat.unshift([
        "Control Number",
        "Finding Title",
        "Date Identified",
        "Finding ID",
        "Information System or Program Name",
        "Repeat Findings",
        "Repeat Finding Weakness ID",
        "Finding Description",
        "Weakness Description",
        "Control Weakness Type",
        "Source",
        "Assessment/Audit Company",
        "Test Method",
        "Test Objective",
        "Test Result Description",
        "Test Result",
        "Recommended Corrective Action(s)",
        "Effect on Business",
        "Likelihood",
        "Impact"
      ]);

      var wb = XLSX.utils.book_new();

      wb.Props = {
        Title: "Compliance Assessment/Audit Tracking (CAAT) Spreadsheet",
        Subject: "Assessment Data",
        Author: "Heimdall",
        CreatedDate: new Date()
      };

      wb.SheetNames.push("Assessment Data");

      var ws = XLSX.utils.aoa_to_sheet(caat);
      wb.Sheets["Assessment Data"] = ws;

      var wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
      saveAs(
        new Blob([this.s2ab(wbout)], { type: "application/octet-stream" }),
        "CAAT-" + this.convertDate(new Date(), "-") + ".xlsx"
      );
    },
    testControls() {
      var filter: Filter = {};
      console.log(getModule(FilteredDataModule, this.$store).controls(filter)); //this.$store.getters["data/allControls"]);
    },
    pad: function(s) {
      return s < 10 ? "0" + s : s;
    },
    convertDate: function(inputFormat, delimiter) {
      var d = new Date(inputFormat);
      return [
        this.pad(d.getMonth() + 1),
        this.pad(d.getDate()),
        d.getFullYear()
      ].join(delimiter);
    },
    br2nl: function(str) {
      if (str == null) return "Not Available";
      return str.replace(/<br ?\/?>/g, "\r\n").substring(0, 32767);
    },
    s2ab: function(s) {
      var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
      var view = new Uint8Array(buf); //create uint8array as viewer
      for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
      return buf;
    }
  }
};
</script>

<style>
.caat-btn-container {
  margin-left: 4px;
}
.button-txt {
  font-size: 10pt;
}
/* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

.tooltip .tooltiptext::after {
  content: " ";
  position: absolute;
  top: 100%; /* At the bottom of the tooltip */
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: black transparent transparent transparent;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>
