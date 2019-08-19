<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :single-expand="singleExpand"
    item-key="id"
    show-expand
    class="my-4 px-4"
  >
    <template #body>
      <tbody>
        <template v-for="item in items">
          <ControlRowHeader
            :key="item.unique_id + 'h'"
            :control="item"
            :expanded="expanded.includes(item.unique_id)"
            @toggle="toggle(item.unique_id)"
          />
          <ControlRowDetails
            v-if="expanded.includes(item.unique_id)"
            :key="item.unique_id + 'b'"
            :control="item"
          />
        </template>
      </tbody>
    </template>

    <template v-slot:top>
      <v-toolbar flat>
        <v-switch
          v-model="singleExpand"
          label="Single expand"
          class="mt-2"
        ></v-switch>
      </v-toolbar>
    </template>
  </v-data-table>
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

interface Header {
  text: string;
  value: string;
  align?: "left" | "right"; // TODO: Find more
  sortable?: boolean;
}

// Tracks the visibility of an HDF control
interface ListElt extends HDFControl {
  // A unique id to be used as a key.
  unique_id: string;
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
  components: { ControlRowHeader, ControlRowDetails }
})
export default class ControlTable extends ControlTableProps {
  // Whether to allow multiple expansions
  singleExpand: boolean = false;

  // List of currently expanded options. If unique id is in here, it is expanded
  expanded: Array<string> = [];

  /** Toggles the given expansion */
  toggle(unique_id: string) {
    if (this.singleExpand) {
      // Check if unique_id already there
      let had = this.expanded.includes(unique_id);

      // Clear
      this.expanded = [];

      // If unique_id is new, add it
      if (!had) {
        this.expanded.push(unique_id);
      }
    } else {
      // Add or remove it from the set, as appropriate. Shortcut this by only adding if delete fails
      let i = this.expanded.indexOf(unique_id);
      if (i < 0) {
        this.expanded.push(unique_id);
      } else {
        this.expanded.splice(i);
      }
    }
  }

  /** Return items as key, value pairs */
  get items(): ListElt[] {
    let mod = getModule(FilteredDataModule, this.$store);
    return mod.controls(this.filter).map(d => {
      let src: InspecFile;
      // This is dumb but effective. We should probably break it out into its own method in a utility class somewhere
      if (isInspecFile(d.sourced_from.sourced_from)) {
        src = d.sourced_from.sourced_from;
      } else {
        src = d.sourced_from.sourced_from.sourced_from;
      }

      // File, hdf wrapper
      let with_id = Object.assign(hdfWrapControl(d.data), {
        unique_id: `${src.unique_id}-${d.data.id}`
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
