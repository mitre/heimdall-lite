<template>
  <!-- We can use Vue transitions too! -->
  <g :key="label">
    <!-- Generate our children here -->
    <Cell
      v-for="(child, index) in node.children"
      :key="label + index"
      :selected_node="selected_node"
      :depth="child_depth"
      :node="child"
      @select-node="select_node"
    />

    <!-- The actual body of this square.  width add selectedNode.x0-->
    <rect
      :key="label"
      :style="cell_style"
      :x="node.x0"
      :y="node.y0"
      :width="width"
      :height="height"
      :class="cell_classes"
      @click="select_node(node)"
    />

    <text
      v-if="_depth === 1"
      dominant-baseline="middle"
      text-anchor="middle"
      :transform="
        `translate(${node.x0 + width / 2} ${node.y0 +
          height / 3}) scale(${scale} ${scale})`
      "
      style="fill-opacity: 1;"
    >
      {{ label }}
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
import { TreemapDatumType, isHDFControl } from "@/utilities/treemap_util";
import { HierarchyRectangularNode } from "d3";
import ColorHackModule from "@/store/color_hack";

// We declare the props separately to make props types inferable.
const CellProps = Vue.extend({
  props: {
    selected_node: {
      type: Object, // Of type d3.HierarchyRectangularNode<TreemapDatumType>,
      required: true
    },
    node: {
      type: Object, // Of type d3.HierarchyRectangularNode<TreemapDatumType>
      required: true
    },
    depth: {
      type: Number, // Distance of this node to curr selected. 0 => it is curr selected. undefined => Sub root / unknown
      required: false
    }
  }
});

/**
 * Categories property must be of type Category
 * Emits "select-node" with payload of type d3.HierarchyRectangularNode<TreemapDatumType>
 */
@Component({
  components: {},
  name: "Cell"
})
export default class Cell extends CellProps {
  scale: number = 1.0;

  /** Provide typed getters */
  get _node(): d3.HierarchyRectangularNode<TreemapDatumType> {
    return this.node;
  }

  get _selected_node(): d3.HierarchyRectangularNode<TreemapDatumType> {
    return this.selected_node;
  }

  get _depth(): number | undefined {
    if (this.depth === undefined) {
      return this._node === this._selected_node ? 0 : undefined;
    } else {
      return this.depth;
    }
  }

  /** Depth to pass to childen */
  get child_depth(): number | undefined {
    if (this._depth !== undefined) {
      return this._depth + 1;
    } else {
      return undefined;
    }
  }

  /** Are we a control? */
  get is_control(): boolean {
    return isHDFControl(this._node.data);
  }

  /** Width and height calculators */
  get width(): number {
    return this._node.x1 - this._node.x0;
  }

  get height(): number {
    return this._node.y1 - this._node.y0;
  }

  /** Classes for our "body" */
  get cell_classes(): string[] {
    // Type stuff
    let s: string[] = [];
    if (this.is_control) {
      s.push("control");
    } else {
      s.push("group");
    }

    // Depth stuff
    if (this._depth === undefined) {
      s.push("unfocused");
    } else if (this._depth === 0) {
      s.push("root");
    } else if (this._depth === 1) {
      s.push("top");
    }

    return s;
  }

  get cell_style(): string {
    let style: string = "";
    style += `fill: ${this.color};`;
    if (this._depth === 1) {
      style += "pointer-events: auto;";
    } else {
      style += "pointer-events: none;";
    }
    return style;
  }

  // Callbacks for our tree
  select_node(n: null | d3.HierarchyRectangularNode<TreemapDatumType>): void {
    // Pass it up to root
    this.$emit("select-node", n);
  }

  /**
   * Looks up a color for the given piece of data
   * TODO: Shunt this to our color module
   */
  get color(): string {
    let cmod = getModule(ColorHackModule, this.$store);
    let status: ControlGroupStatus = this._node.data.status;
    switch (status) {
      case "Passed":
        return cmod.lookupColor("statusPassed");
      case "Failed":
        return cmod.lookupColor("statusFailed");
      case "No Data":
      case "Empty":
        return cmod.lookupColor("statusNoData");
      case "Not Applicable":
        return cmod.lookupColor("statusNotApplicable");
      case "Not Reviewed":
        return cmod.lookupColor("statusNotReviewed");
      case "Profile Error":
        return cmod.lookupColor("statusProfileError");
      default:
        console.warn(`No treemap color defined for ${status}`);
        return "rgb(187, 187, 187)";
    }
  }

  /**
   * Provides a label for the given piece of data
   */
  get label() {
    if (isHDFControl(this._node.data)) {
      return this._node.data.wraps.id;
    } else {
      return this._node.data.name;
    }
  }
}
</script>

<style scoped>
text {
  pointer-events: none;
}

rect {
  stroke: #fff;
}

.control {
  fill-opacity: 1;
}

.group {
  fill-opacity: 0;
}

.unfocused {
  opacity: 0.1;
}

.top:hover {
  fill-opacity: 0.2;
}
</style>
