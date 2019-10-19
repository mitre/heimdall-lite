<template>
  <v-container fluid>
    <v-row dense>
      <v-col :cols="4">
        NIST SP 800-53 Coverage
      </v-col>
      <v-col :cols="8">
        <v-btn @click="up" :disabled="!allow_up" block x-small>
          <v-icon v-if="allow_up"> mdi-arrow-left </v-icon>
          {{ selected_node.data.name }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col :cols="12" v-resize:debounce="on_resize">
        <svg id="chartBody" :width="width" :height="height">
          <g
            style="shape-rendering: crispEdges;"
            preserveAspectRatio="xMidYMid meet"
          >
            <!-- The body -->
            <Cell
              :selected_node="selected_node"
              :selected_control_id="NONEFORNOW"
              :node="treemap_layout"
              :scales="scales"
              @select-node="select_node"
            />
          </g>
        </svg>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
//               preserveAspectRatio="xMidYMid meet"
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import { ControlStatus, HDFControl, nist, hdfWrapControl } from "inspecjs";
import * as d3 from "d3";
import FilteredDataModule, { TreeMapState } from "@/store/data_filters";
import {
  TreemapNode,
  build_nist_tree_map,
  is_leaf
} from "@/utilities/treemap_util";
import { HierarchyRectangularNode, tree } from "d3";
import Cell, { XYScale } from "@/components/cards/treemap/Cell.vue";
//@ts-ignore
import resize from "vue-resize-directive";

// We declare the props separately to make props types inferable.
const TreemapProps = Vue.extend({
  props: {
    value: {
      type: Array, // Of type TreeMapState, representing current descent path
      required: true
    },
    /*
    path: {
      type: Array, // Of type TreeMapState, representing current descent path
      required: true
    },
    selected_control: {
      type: string, // Represents control id
      required: false
    },
    */
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
  },
  directives: {
    resize
  }
})
export default class Treemap extends TreemapProps {
  /** The svg internal coordinate space */
  width: number = 1600;
  height: number = 530;

  /** The currently selected treemap node. Wrapped to avoid initialization woes */
  get selected_node(): d3.HierarchyRectangularNode<TreemapNode> {
    // Get typed versions of the curr state
    let val = this.value as TreeMapState;
    let curr = this.treemap_layout;
    let depth = 0;

    try {
      for (; depth < val.length; depth++) {
        let next_incursion = val[depth];
        // We use "as any" here because, honestly, I'm lazy. Makes the try catch handle all of the tough work
        let new_curr = curr.children!.find(
          child => (child as any).name === next_incursion
        );
        if (new_curr) {
          curr = new_curr;
        } else {
          throw "truncate";
        }
      }
    } catch (some_traversal_error) {
      // Slice to last successful depth. Slice is non inclusive so this works
      this.$emit("input", val.slice(0, depth));
    }

    // Return as deep as we travelled
    return curr;
  }

  /** Get our viewbox */
  get view_box(): string {
    return `0 0 ${this.width} ${this.height}`;
  }

  /** Get our scales */
  get scales(): XYScale {
    return {
      scale_x: d3
        .scaleLinear()
        .domain([this.selected_node.x0, this.selected_node.x1])
        .range([0, this.width]),
      scale_y: d3
        .scaleLinear()
        .domain([this.selected_node.y0, this.selected_node.y1])
        .range([0, this.height])
    };
  }

  /** Generates a d3 heirarchy structure, with appropriate bounds to our width
   *  detailing all of the controls in the nist hash */
  get treemap_layout(): d3.HierarchyRectangularNode<TreemapNode> {
    // Get our data module
    let data: FilteredDataModule = getModule(FilteredDataModule, this.$store);

    // Get the currejnt filtered data
    let controls = data.controls(this.filter);

    // Build the map
    let hierarchy = build_nist_tree_map(controls);
    let treemap = d3
      .treemap<TreemapNode>()
      .size([this.width, this.height])
      .round(false)
      .paddingInner(0)(hierarchy);
    return treemap;
  }

  // Callbacks for our tree
  // NOTE: SHOULD ONLY EVER BE CALLED ON CURRENT DESCENDANTS. LOGIC BREAKS OTHERWISE
  select_node(n: d3.HierarchyRectangularNode<TreemapNode>): void {
    // If it is a leaf, then select it
    let new_state: TreeMapState;
    if (is_leaf(n.data)) {
      console.error("We don't yet support this");
      return;
      //let id = n.data.control.data.id;
    } else {
      // Otherwise, dive away. Set our directive to the last directive in the given control
      let cntrl = n.data.nist_control!;
      let l = cntrl.sub_specs.length;
      new_state = [...(this.value as TreeMapState)];
      if (l) {
        new_state.push(cntrl.sub_specs[l - 1]);
      } else {
        new_state.push(cntrl.family);
      }
    }
    this.$emit("input", new_state);
  }

  /** Submits an event to go up one node */
  up(): void {
    if (this.value.length) {
      this.value.pop();
    }
  }

  /** Controls whether we should allow up */
  get allow_up(): boolean {
    return this.selected_node.parent !== null;
  }

  /** Called on resize */
  on_resize(elt: any) {
    if (elt.clientWidth !== undefined && elt.clientWidth > 1) {
      this.width = elt.clientWidth - 24;
    }
  }
}
</script>

<style scoped>
text {
  pointer-events: none;
  font-weight: bold;
  font-size: 1.1em;
  fill: "primary";
}

rect {
  fill: none;
}
</style>
