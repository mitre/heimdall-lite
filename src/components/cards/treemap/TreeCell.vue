<template functional>
  <g class="children">
    <!-- Generate the children squares (only visible on hover of a square)-->
    <rect
      v-for="(child, index) in node.children"
      class="child"
      :key="index"
      :height="y(child.y1) - y(child.y0)"
      :width="x(child.x1) - x(child.x0)"
      :x="x(child.x0)"
      :y="y(child.y0)"
      :style="{ fill: color(grand_child.data) }"
    ></rect>

    <!--
                  The visible square rect element.
                  You can attribute directly an event, that fires a method that changes the current node,
                  restructuring the data tree, that reactivly gets reflected in the template.
                -->
    <rect
      class="parent"
      @click="$emit('selected')"
      :x="x(node.x0)"
      :y="y(node.y0)"
      :width="x(node.x1 - node.x0 + selectedNode.x0)"
      :height="y(node.y1 - node.y0 + selectedNode.y0)"
      :style="{ fill: color(child.data) }"
      :rx="
        (node.data.wraps && node.data.wraps.id) === value.selectedControlID
          ? 15
          : 0
      "
    >
      <!-- The title attribute, shown on hover -->
      <title v-if="child.data.count">
        {{ `${label(child.data)} | ${child.data.count}` }}
      </title>
      <title v-else>{{ label(node.data) }}</title>
    </rect>

    <!-- The visible square text element with the title and value of the child node -->
    <text
      dy="1em"
      :key="'t_' + child.id"
      :x="x(node.x0) + 6"
      :y="y(node.y0) + 6"
      style="fill-opacity: 1;"
    >
      {{ label(child.data) }}
    </text>

    <text
      dy="2.25em"
      :key="'tt_' + child.id"
      :x="x(node.x0) + 6"
      :y="y(node.y0) + 6"
      style="fill-opacity: 1;"
      v-if="node.data.count > 0"
    >
      {{ data.count }}
    </text>
  </g>
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
import FilteredDataModule, { NistMapState } from "@/store/data_filters";
import {
  nistHashToTreeMap,
  TreemapNode,
  TreemapDatumType,
  isHDFControl
} from "@/utilities/treemap_util";
import { HierarchyRectangularNode, tree } from "d3";
import ColorHackModule from "@/store/color_hack";

// We declare the props separately to make props types inferable.
const TreeCellProps = Vue.extend({
  props: {
    _node: {
      type: Object, // Of type d3.HeirarchyRectangularNode<TreemapDatumType>
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
export default class TreeCell extends TreeCellProps {
  /** Typed accessor to node */
  get node(): d3.HierarchyRectangularNode<TreemapDatumType> {
    return this._node;
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
  color(): string {
    let status: ControlGroupStatus = this.node.data.status;
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
  label() {
    if (isHDFControl(this.node.data)) {
      return this.node.data.wraps.id;
    } else {
      return this.node.data.name;
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
