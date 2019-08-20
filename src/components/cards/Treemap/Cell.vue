<template>
  <!-- We can use Vue transitions too! -->
  <transition-group name="list" tag="g" class="depth">
    <!-- Generate each of the visible squares at a given zoom level (the current selected node) -->
    <g
      v-for="child in selectedNode.children"
      :key="`child_group_${label(child.data)}`"
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
        :rx="
          (child.data.wraps && child.data.wraps.id) === value.selectedControlID
            ? 15
            : 0
        "
      >
        <!-- The title attribute, shown on hover -->
        <title v-if="child.data.count">
          {{ `${label(child.data)} | ${child.data.count}` }}
        </title>
        <title v-else>{{ label(child.data) }}</title>
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
import { TreemapDatumType, isHDFControl } from "@/utilities/treemap_util";
import { HierarchyRectangularNode } from "d3";
import ColorHackModule from "@/store/color_hack";

// We declare the props separately to make props types inferable.
const TreemapProps = Vue.extend({
  props: {
    node: {
      type: Object, // Of type d3.HeirarchyRectangularNode<TreemapDatumType>
      required: true
    },
    x: {
      type: Object, // Of type d3.ScaleLinear<number, number>
      required: true
    },
    y: {
      type: Object,
      required: true // Of type d3.ScaleLinear<number, number>
    }
  }
});

/**
 * Categories property must be of type Category
 * Emits "select-node" with payload of type d3.HeirarchyRectangularNode<TreemapDatumType>
 */
@Component({
  components: {},
  name: "Cell"
})
export default class Cell extends CellProps {
  /** Provide typed getters */
  get _node(): d3.HeirarchyRectangularNode<TreemapDatumType> {
    return this.node;
  }
  get _x(): d3.ScaleLinear<number, number> {
    return this.x;
  }
  get _y(): d3.ScaleLinear<number, number> {
    return this.y;
  }

  /** The currently selected treemap node. Wrapped to avoid initialization woes */
  // Callbacks for our tree
  selectNode(n: null | d3.HierarchyRectangularNode<TreemapDatumType>): void {
    // Pass it up to root
    this.$emit("selectNode", n);
  }

  // These functions define the current viewport on the treeview
  /** Returns the current x position within the overall range */
  child_x(
    child_node: d3.HeirarchyRectangularNode<TreemapDatumType>
  ): d3.ScaleLinear<number, number> {
    return d3
      .scaleLinear()
      .domain([node.x0, node.x0 + (node.x1 - node.x0)])
      .range([0, this.width]);
  }

  /** Returns the current y position within the overall range */
  child_y(): d3.ScaleLinear<number, number> {
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
  fill-opacity: 0.8;
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
