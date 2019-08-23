<template>
  <v-container>
    <!-- Toolbar -->
    <v-row>
      <v-col cols="12">
        <v-toolbar flat>
          <v-switch
            v-model="single_expand"
            label="Single expand"
            class="mt-2"
          ></v-switch>
        </v-toolbar>
      </v-col>
    </v-row>

    <!-- Header. This should mirror the structure of ControlRowHeader -->
    <ResponsiveRowSwitch>
      <template #expand> </template>

      <template #id>
        <ColumnHeader
          text="ID"
          @input="set_sort('id', $event)"
          :sort="sort_id"
        />
      </template>

      <template #status>
        <ColumnHeader
          text="Status"
          @input="set_sort('status', $event)"
          :sort="sort_status"
        />
      </template>

      <template #severity>
        <ColumnHeader
          text="Severity"
          @input="set_sort('severity', $event)"
          :sort="sort_severity"
        />
      </template>

      <template #title>
        <ColumnHeader text="Title" sort="disabled" />
      </template>

      <template #tags>
        <ColumnHeader text="Tags" sort="disabled" />
      </template>
    </ResponsiveRowSwitch>

    <!-- Body -->
    <template v-for="item in visible_items">
      <ControlRowHeader
        :key="item.key + 'h'"
        :control="item"
        :expanded="expanded.includes(item.key)"
        @toggle="toggle(item.key)"
      />
      <v-divider :key="item.key + 'd1'" v-if="!expanded.includes(item.key)" />
      <ControlRowDetails
        v-if="expanded.includes(item.key)"
        :key="item.key + 'b'"
        :control="item"
      />
      <v-divider :key="item.key + 'd2'" v-if="expanded.includes(item.key)" />
    </template>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import { hdfWrapControl, HDFControl, ControlStatus } from "inspecjs";
import FilteredDataModule from "@/store/data_filters";
import { isInspecFile, InspecFile } from "@/store/report_intake";
import ControlRowHeader from "@/components/cards/controltable/ControlRowHeader.vue";
import ControlRowDetails from "@/components/cards/controltable/ControlRowDetails.vue";
import ColumnHeader, { Sort } from "@/components/generic/ColumnHeader.vue";
import ResponsiveRowSwitch from "@/components/cards/controltable/ResponsiveRowSwitch.vue";
import { control_unique_key } from "@/utilities/format_util";
import { ContextualizedControl } from "../../../store/data_store";

type ShowCount = "all" | number;

// Tracks the visibility of an HDF control
interface ListElt extends HDFControl {
  // A unique id to be used as a key.
  key: string;

  // Computed values for status and severity "value"
  status_val: number;
  severity_val: number;
}

// We declare the props separately to make props types inferable.
const ControlTableProps = Vue.extend({
  props: {
    filter: {
      type: Object, // Of type filter
      required: true
    }
  }
});

@Component({
  components: {
    ControlRowHeader,
    ControlRowDetails,
    ColumnHeader,
    ResponsiveRowSwitch
  }
})
export default class ControlTable extends ControlTableProps {
  // Whether to allow multiple expansions
  single_expand: boolean = false;

  // How many items to show per page
  show_count: ShowCount = 20;

  // Our page start index, if we aren't showing all
  index: number = 0;

  // List of currently expanded options. If unique id is in here, it is expanded
  expanded: Array<string> = [];

  // Sorts
  sort_id: Sort = "none";
  sort_status: Sort = "none";
  sort_severity: Sort = "none";

  set_sort(column: "id" | "status" | "severity", new_sort: Sort) {
    this.sort_id = "none";
    this.sort_status = "none";
    this.sort_severity = "none";
    switch (column) {
      case "id":
        this.sort_id = new_sort;
        break;
      case "status":
        this.sort_status = new_sort;
        break;
      case "severity":
        this.sort_severity = new_sort;
        break;
    }
  }

  /** Toggles the given expansion */
  toggle(key: string) {
    if (this.single_expand) {
      // Check if key already there
      let had = this.expanded.includes(key);

      // Clear
      this.expanded = [];

      // If key is new, add it
      if (!had) {
        this.expanded.push(key);
      }
    } else {
      // Add or remove it from the set, as appropriate. Shortcut this by only adding if delete fails
      let i = this.expanded.indexOf(key);
      if (i < 0) {
        this.expanded.push(key);
      } else {
        this.expanded.splice(i);
      }
    }
  }

  /** Return items as key, value pairs */
  get raw_items(): ListElt[] {
    let mod = getModule(FilteredDataModule, this.$store);
    return mod.controls(this.filter).map(d => {
      let key = control_unique_key(d);

      // File, hdf wrapper
      let hdf = hdfWrapControl(d.data);
      let with_id = Object.assign(hdf, {
        key,
        status_val: [
          "Passed",
          "Not Applicable",
          "No Data",
          "Not Reviewed",
          "Profile Error",
          "Failed"
        ].indexOf(hdf.status),
        severity_val: ["none", "low", "medium", "high", "critical"].indexOf(
          hdf.severity
        )
      });
      return with_id;
    });
  }

  /** Return items sorted */
  get items(): ListElt[] {
    // Controls ascending/descending
    let factor: number = 1;
    // Our comparator function
    let cmp: (a: ListElt, b: ListElt) => number;

    if (this.sort_id === "ascending" || this.sort_id === "descending") {
      cmp = (a: ListElt, b: ListElt) => a.wraps.id.localeCompare(b.wraps.id);
      if (this.sort_id === "ascending") {
        factor = -1;
      }
    } else if (
      this.sort_status === "ascending" ||
      this.sort_status === "descending"
    ) {
      cmp = (a: ListElt, b: ListElt) => a.status_val - b.status_val;
      if (this.sort_status === "ascending") {
        factor = -1;
      }
    } else if (
      this.sort_severity === "ascending" ||
      this.sort_severity === "descending"
    ) {
      cmp = (a: ListElt, b: ListElt) => a.severity_val - b.severity_val;
      if (this.sort_severity === "ascending") {
        factor = -1;
      }
    } else {
      return this.raw_items;
    }
    return this.raw_items.sort((a, b) => cmp(a, b) * factor);
  }

  /** Return the items we should be showing */
  get visible_items(): ListElt[] {
    if (this.show_count === "all") {
      return this.items;
    } else {
      return this.items.slice(this.index, this.index + this.show_count);
    }
  }
}
</script>
