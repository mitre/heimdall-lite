<template>
  <v-card>
    <v-card-title>
      <v-icon icon="chart" /> NIST SP 800-53 Coverage<v-btn @:click="clear">
        Clear Filter
      </v-btn>
    </v-card-title>
    <v-card-text>
      <div class="treemap">
        <!-- The SVG structure is explicitly defined in the template with attributes derived from component data -->
        <!-- Note that within this code:
         - Grandparent is the parent of the currently selected node. 
         - Parent is the currently selected node (e.g. selectedNode)
         - Each "child" iterated item is a child of Parent. (e.g. in selectedNode.children)
         - Further, each "grand_child" is a child of a child of parent.
         -->
        <svg id="chartBody" :viewBox="viewBoxComp">
          <g
            style="shape-rendering: crispEdges;"
            width="100%"
            height="100%"
            transform="translate(0,20)"
          >
            <!-- We can use Vue transitions too! -->
            <transition-group name="list" tag="g" class="depth">
              <!-- Generate each of the visible squares at a given zoom level (the current selected node) -->
              <g
                class="children"
                v-for="child in selectedNode.children"
                :key="`child_group_${child.data.name}`"
              >
                <!-- Generate the children squares (only visible on hover of a square) FIX THIS-->
                <rect
                  v-for="grand_child in child.children"
                  class="child"
                  :id="grand_child.id"
                  :key="`grand_child_hover_${label(grand_child.data)}`"
                  :height="y(grand_child.y1) - y(grand_child.y0)"
                  :width="x(grand_child.x1) - x(grand_child.x0)"
                  :x="x(grand_child.x0)"
                  :y="y(grand_child.y0)"
                  :style="{ fill: color(grand_child.data) }"
                ></rect>

                <!--
                  The visible square rect element.
                  You can attribute directly an event, that fires a method that changes the current node,
                  restructuring the data tree, that reactivly gets reflected in the template.
                -->
                <rect
                  class="parent"
                  @click="selectNode(child)"
                  :key="`child_body_group_${child.id}`"
                  :x="x(child.x0)"
                  :y="y(child.y0)"
                  :width="x(child.x1 - child.x0 + selectedNode.x0)"
                  :height="y(child.y1 - child.y0 + selectedNode.y0)"
                  :style="{ fill: color(child.data) }"
                >
                  <!-- The title attribute -->
                  <title>
                    {{ `${child.data.desc} | ${child.data.count}` }}
                  </title>
                </rect>

                <!-- The visible square text element with the title and value of the child node -->
                <text
                  dy="1em"
                  :key="'t_' + child.id"
                  :x="x(child.x0) + 6"
                  :y="y(child.y0) + 6"
                  style="fill-opacity: 1;"
                >
                  {{ label(child.data) }}
                </text>

                <text
                  dy="2.25em"
                  :key="'tt_' + child.id"
                  :x="x(child.x0) + 6"
                  :y="y(child.y0) + 6"
                  style="fill-opacity: 1;"
                  v-if="child.data.count > 0"
                >
                  {{ child.data.count }}
                </text>
              </g>
            </transition-group>

            <!-- The top most element, representing the previous node -->
            <g class="grandparent">
              <rect
                :height="top_margin"
                @click="selectNode(selectedNode.parent)"
                :width="width"
                :y="top_margin * -1"
                v-if="selectedNode.parent"
              ></rect>

              <!-- The visible square text element with the id (basically a breadcumb, if you will) -->
              <text dy=".65em" x="6" y="-14">
                {{ label(selectedNode.data) }}
              </text>
            </g>
          </g>
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
import FilteredDataModule from "@/store/data_filters";
import {
  nistHashToTreeMap,
  TreemapNode,
  TreemapDatumType,
  isHDFControl
} from "@/utilities/treemap_util";
import { HierarchyRectangularNode, tree } from "d3";
import ColorHackModule from "@/store/color_hack";

// We declare the props separately to make props types inferable.
const TreemapProps = Vue.extend({
  props: {
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
  components: {}
})
export default class Treemap extends TreemapProps {
  /** The currently selected NIST family, if any */
  get selectedFamily(): string | null {
    let ancestors = this.selectedNode.ancestors().reverse();
    if (ancestors.length < 2) {
      // Too short a chain; we must not have anything selected
      return null;
    } else {
      // One down from root
      return (ancestors[1].data as NistFamily).name;
    }
  }

  /** The currently selected NIST category, if any. */
  get selectedSubFamily(): string | null {
    let ancestors = this.selectedNode.ancestors().reverse();
    if (ancestors.length < 3) {
      // Too short a chain; we must not have enough selected
      return null;
    } else {
      // One down from root
      return (ancestors[2].data as NistCategory).name;
    }
  }

  /**  The currently selected NIST control, if any. Value should be a unique ID, not the control ID */
  get selectedControlID(): number | null {
    return null;
  }

  /** Current size allowance */
  width: number = 1000;
  height: number = 530;
  top_margin: number = 20;

  /** The currently selected treemap node. Wrapped to avoid initialization woes */
  selectedNodeState: d3.HierarchyRectangularNode<
    TreemapDatumType
  > | null = null;
  get selectedNode(): d3.HierarchyRectangularNode<TreemapDatumType> {
    if (this.selectedNodeState === null) {
      return this.treemapLayout;
    } else {
      return this.selectedNodeState;
    }
  }

  /**
   * Fetches the controls we want to display in this tree.
   * Note that regardless of what filtering this treeview applies,
   * we want the treeview itself to remain unaffected.
   *
   * TODO: Make sure that this filter is stripped of unwanted fields!
   * */
  get nistControls(): HDFControl[] {
    // Get our data module
    let data: FilteredDataModule = getModule(FilteredDataModule, this.$store);

    // Get the current filtered data
    return data.controls(this.filter).map(c => hdfWrapControl(c.data));
  }

  /** Generates the nist hash for our currently visible controls */
  get nistHash(): NistHash {
    let hash = generateNewNistHash();
    populateNistHash(this.nistControls, hash);
    return hash;
  }

  /** Generates a d3 heirarchy structure outlining all of the data in the nist hash */
  get treemapLayout(): d3.HierarchyRectangularNode<TreemapDatumType> {
    let heirarchy = nistHashToTreeMap(this.nistHash);
    let treemap = d3
      .treemap<TreemapDatumType>()
      .size([this.width, this.height])
      .round(false)
      .paddingInner(0)(heirarchy);
    console.log(treemap);
    return treemap;
  }

  // Callbacks for our tree
  selectNode(n: d3.HierarchyRectangularNode<TreemapDatumType>) {
    this.selectedNodeState = n;
  }

  /** Resets treemap selection back to root. */
  clear(): void {
    this.selectedNodeState = null;
  }

  // These functions define the current viewport on the treeview
  /** Returns the current x position within the overall range */
  get x(): d3.ScaleLinear<number, number> {
    //d3.ScaleLinear<number, number> {
    let node = this.selectedNode;
    return d3
      .scaleLinear()
      .domain([node.x0, node.x0 + (node.x1 - node.x0)])
      .range([0, this.width]);
  }

  /** Returns the current y position within the overall range */
  get y(): d3.ScaleLinear<number, number> {
    let node = this.selectedNode;
    return d3
      .scaleLinear()
      .domain([node.y0, node.y0 + (node.y1 - node.y0)])
      .range([0, this.height - this.top_margin]);
  }

  /** Sets the viewbox on the treemap svg */
  get viewBoxComp() {
    return `0 0 ${this.width} ${this.height}`;
  }

  /** Color lookup scheme */
  get color_table(): { [key: string]: string } {
    let cmod = getModule(ColorHackModule, this.$store);
    return {
      Passed: cmod.lookupColor("statusPassed"),
      Failed: cmod.lookupColor("statusFailed"),
      "No Data": cmod.lookupColor("statusNoData"),
      "Not Applicable": cmod.lookupColor("statusNotApplicable"),
      "Not Reviewed": cmod.lookupColor("statusNotReviewed"),
      "Profile Error": cmod.lookupColor("statusProfileError"),
      Empty: "rgb(187, 187, 187)"
    };
  }

  /**
   * Looks up a color for the given piece of data
   */
  color(datum: TreemapDatumType): string {
    let status: ControlGroupStatus = datum.status;
    if (status in this.color_table) {
      return this.color_table[status];
    } else {
      console.warn(`No treemap color defined for ${status}`);
      return "#ece2ca";
    }
  }

  /**
   * Provides a label for the given piece of data
   */
  label(datum: TreemapDatumType) {
    if (isHDFControl(datum)) {
      return datum.wraps.id;
    } else {
      return datum.name;
    }
  }
}
</script>

<style scoped>
text {
  pointer-events: none;
}

.grandparent text {
  font-weight: bold;
  color: red;
}

rect {
  fill: none;
  stroke: #fff;
}

rect.parent,
.grandparent rect {
  stroke-width: 2px;
}

.grandparent rect {
  fill: #99ccff;
}

.grandparent:hover rect {
  fill: #99ccff;
}

.children rect.parent,
.grandparent rect {
  cursor: pointer;
}

.children rect.parent {
  fill: #bbb;
  fill-opacity: 1;
}

.children:hover rect.parent {
  fill-opacity: 0;
}
.children:hover rect.child {
  fill: #bbb;
  fill-opacity: 0.5;
}

.children text {
  font-size: 0.8em;
}

.grandparent text {
  font-size: 0.9em;
}

.list-enter-active,
.list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to /* .list-leave-active for <2.1.8 */ {
  opacity: 0;
}
</style>
