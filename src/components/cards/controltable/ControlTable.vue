<template>
  <v-container>
    <!-- Toolbar -->
    <v-row>
      <v-col cols="12">
        <v-toolbar flat>
          <v-switch
            v-model="singleExpand"
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
        <ColumnHeader text="ID" />
      </template>

      <template #status>
        <ColumnHeader text="Status" />
      </template>

      <template #severity>
        <ColumnHeader text="Severity" />
      </template>

      <template #title>
        <ColumnHeader text="Title" />
      </template>

      <template #tags>
        <ColumnHeader text="Tags" />
      </template>
    </ResponsiveRowSwitch>

    <!-- Body -->
    <template v-for="item in items">
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
import { hdfWrapControl, HDFControl } from "inspecjs";
import FilteredDataModule from "@/store/data_filters";
import { isInspecFile, InspecFile } from "@/store/report_intake";
import ControlRowHeader from "@/components/cards/controltable/ControlRowHeader.vue";
import ControlRowDetails from "@/components/cards/controltable/ControlRowDetails.vue";
import ColumnHeader from "@/components/generic/ColumnHeader.vue";
import ResponsiveRowSwitch from "@/components/cards/controltable/ResponsiveRowSwitch.vue";
import { control_unique_key } from "@/utilities/format_util";

interface Header {
  text: string;
  value: string;
  align?: "left" | "right"; // TODO: Find more
  sortable?: boolean;
}

// Tracks the visibility of an HDF control
interface ListElt extends HDFControl {
  // A unique id to be used as a key.
  key: string;
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
  singleExpand: boolean = false;

  // List of currently expanded options. If unique id is in here, it is expanded
  expanded: Array<string> = [];

  /** Toggles the given expansion */
  toggle(key: string) {
    if (this.singleExpand) {
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
  get items(): ListElt[] {
    let mod = getModule(FilteredDataModule, this.$store);
    return mod.controls(this.filter).map(d => {
      let key = control_unique_key(d);

      // File, hdf wrapper
      let with_id = Object.assign(hdfWrapControl(d.data), {
        key
      });
      return with_id;
    });
  }

  // Table headers
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
