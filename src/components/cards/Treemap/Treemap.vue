<template>
  <v-card>
    <v-card-title>
      <v-container>
        <v-row>
          <v-col :cols="6">
            NIST SP 800-53 Coverage
          </v-col>
          <v-col :cols="3">
            <v-btn @click="up" :disabled="!allow_up" block>
              <v-icon v-if="allow_up"> arrow_back </v-icon>
              {{ selected_node.data.name }}
            </v-btn>
          </v-col>
          <v-col :colr="3">
            <v-btn @click="clear" block>
              <v-icon icon="chart" />
              Clear Filter
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card-title>
    <v-card-text>
      <div class="treemap">
        <svg
          id="chartBody"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="500"
        >
          <svg :viewBox="view_box">
            <g style="shape-rendering: crispEdges;">
              <!-- The body -->
              <Cell
                :selected_node="selected_node"
                :node="treemap_layout"
                @select-node="select_node"
              />
            </g>
          </svg>

          <!-- The current labels, floating in the void -->
          <text
            v-for="label in labels"
            :key="label.text"
            :x="label.x"
            :y="label.y"
            dominant-baseline="middle"
            text-anchor="middle"
            style="fill-opacity: 1;"
          >
            {{ label.text }}
          </text>
        </svg>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import {
  ControlStatus,
  HDFControl,
  NistHash,
  hdfWrapControl,
  NistFamily,
  NistCategory,
  generateNewNistHash,
  populateNistHash,
  ControlGroupStatus
} from "inspecjs";
import * as d3 from "d3";
// import { scaleLinear, scaleOrdinal } from "d3-scale";
// import { json } from "d3-request";
// import { hierarchy, treemap } from "d3-hierarchy";
import FilteredDataModule, { NistMapState } from "@/store/data_filters";
import {
  nistHashToTreeMap,
  TreemapNode,
  TreemapDatumType,
  isHDFControl
} from "@/utilities/treemap_util";
import { HierarchyRectangularNode, tree } from "d3";
import Cell from "@/components/cards/treemap/Cell.vue";

// Type of labels shown on the screen
interface Label {
  // The x and y coordinates in screen space
  x: number;
  y: number;

  // The text
  text: string;
}

// We declare the props separately to make props types inferable.
const TreemapProps = Vue.extend({
  props: {
    value: {
      type: Object, // Of type NistMapState
      required: true
    },
    filter: {
      type: Object, // Of type Filter
      required: true
    }
  }
});

/**
 * Categories property must be of type Category
 * Emits "filter-status" with payload of type ControlStatus
 */
@Component({
  components: {
    Cell
  }
})
export default class Treemap extends TreemapProps {
  /** The currently selected treemap node. Wrapped to avoid initialization woes */
  get selected_node(): d3.HierarchyRectangularNode<TreemapDatumType> {
    // Get typed versions of the curr state
    let val: NistMapState = this.value;
    let curr = this.treemap_layout;

    // Try to go to the selected family
    // If we cannot go, fail out and update the state
    if (val.selectedFamily) {
      let new_curr = curr.children!.find(
        child => (child.data as NistFamily).name === val.selectedFamily
      );
      if (new_curr !== undefined) {
        curr = new_curr;
      } else {
        // Unable to go to the specified family
        let revised: NistMapState = {
          selectedFamily: null, // This one failed
          selectedCategory: null,
          selectedControlID: null
        };
        this.$emit("input", revised);
        return curr;
      }
    }
    // Try to go to the selected category
    // If we cannot go, fail out and update the state
    if (val.selectedCategory) {
      let new_curr = curr.children!.find(
        child => (child.data as NistCategory).name === val.selectedCategory
      );
      if (new_curr !== undefined) {
        curr = new_curr;
      } else {
        // Unable to go to the specified category
        let revised: NistMapState = {
          selectedFamily: val.selectedFamily, // This one went off ok
          selectedCategory: null, // This one failed
          selectedControlID: null
        };
        this.$emit("input", revised);
        return curr;
      }
    }

    // Check the selected category. We don't actually go to it, just validate that it exists
    if (val.selectedControlID) {
      let test_curr = curr.children!.find(
        child => (child.data as HDFControl).wraps.id === val.selectedControlID
      );
      if (test_curr == undefined) {
        // Unable to go to the specified control
        let revised: NistMapState = {
          selectedFamily: val.selectedFamily, // This one went off ok
          selectedCategory: val.selectedCategory, // This one as well
          selectedControlID: null // This one failed
        };
        this.$emit("input", revised);
      }
    }

    // Return as deep as we travelled
    return curr;
  }

  /** Get our viewbox */
  get view_box(): string {
    let n = this.selected_node;
    return `${n.x0} ${n.y0} ${n.x1 - n.x0} ${n.y1 - n.y0}`;
  }

  /** Get our current labels */
  get labels(): Label[] {
    // Get our current tops
    let tops = this.selected_node.children!;

    // Create linear scales to map x/y to viewport x/y

    return [];
  }

  /**
   * Fetches the controls we want to display in this tree.
   * Note that regardless of what filtering this treeview applies,
   * we want the treeview itself to remain unaffected.
   *
   * TODO: Make sure that this filter is stripped of unwanted fields!
   * */
  get nist_controls(): HDFControl[] {
    // Get our data module
    let data: FilteredDataModule = getModule(FilteredDataModule, this.$store);

    // Get the current filtered data
    let controls = data.controls(this.filter).map(c => hdfWrapControl(c.data));
    return controls;
  }

  /** Generates the nist hash for our currently visible controls */
  get nist_hash(): NistHash {
    let hash = generateNewNistHash();
    populateNistHash(this.nist_controls, hash);
    return hash;
  }

  /** Generates a d3 heirarchy structure outlining all of the data in the nist hash */
  get treemap_layout(): d3.HierarchyRectangularNode<TreemapDatumType> {
    let heirarchy = nistHashToTreeMap(this.nist_hash);
    let treemap = d3
      .treemap<TreemapDatumType>()
      .size([1000, 500])
      .round(false)
      .paddingInner(0)(heirarchy);
    return treemap;
  }

  // Callbacks for our tree
  select_node(n: null | d3.HierarchyRectangularNode<TreemapDatumType>): void {
    // Avoid selecting falsey nodes
    if (!n) {
      console.log("Attempted to select Null Node in Treemap");
      return;
    }

    // Get our path to the selected node
    let route = n.ancestors().reverse();

    // Initialize all as null
    let selected_family: string | null = null;
    let selected_category: string | null = null;
    let selected_control_id: string | null = null;

    // Depending on length of route, assign values
    if (route.length > 1) {
      selected_family = (route[1].data as NistFamily).name;
    }
    if (route.length > 2) {
      selected_category = (route[2].data as NistCategory).name;
    }
    if (route.length > 3) {
      selected_control_id = (route[3].data as HDFControl).wraps.id;
      // If they click the same one, clear
      if (selected_control_id === this.value.selectedControlID) {
        selected_control_id = null;
      }
    }

    // Construct the state and emit
    let new_state: NistMapState = {
      selectedFamily: selected_family,
      selectedCategory: selected_category,
      selectedControlID: selected_control_id
    };
    this.$emit("input", new_state);
  }

  /** Submits an event to clear all filters */
  clear(): void {
    this.$emit("clear");
  }

  /** Submits an event to go up one node */
  up(): void {
    this.select_node(this.selected_node.parent);
  }

  /** Controls whether we should allow up */
  get allow_up(): boolean {
    return this.selected_node.parent !== null;
  }
}
</script>

<style scoped>
text {
  pointer-events: none;
}

rect {
  fill: none;
  stroke: #fff;
}
</style>
