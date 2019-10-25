/**
 * Tools used for generating the treemaps consumed by, of course, the Treemap card and associated components.
 */

import { HDFControl, hdfWrapControl, ControlStatus, nist } from "inspecjs";
import * as d3 from "d3";
import { ContextualizedControl } from "@/store/data_store";
import { control_unique_key } from "./format_util";
import ColorHackModule from "@/store/color_hack";
import Chroma from "chroma-js";
import { NistControl } from "inspecjs/dist/nist";

const MAX_DEPTH = 2;

/** A simple wrapper type representing what any node's data might be in our treemap */
interface AbsTreemapNode {
  title: string;
  subtitle?: string;
  hovertext?: string;
  key: string;
  color: string;
  parent: TreemapNodeParent | null; // The parent of this node.
}
export interface TreemapNodeParent extends AbsTreemapNode {
  nist_control?: nist.NistControl;
  children: Array<TreemapNodeParent | TreemapNodeLeaf>;
}

export interface TreemapNodeLeaf extends AbsTreemapNode {
  control: ContextualizedControl;
}

export function is_leaf(n: TreemapNode): n is TreemapNodeLeaf {
  return (n as TreemapNodeLeaf).control !== undefined;
}

export function is_parent(n: TreemapNode): n is TreemapNodeParent {
  return (n as TreemapNodeParent).children !== undefined;
}

/** The type of our treemap nodes, prior to rendering */
export type TreemapNode = TreemapNodeLeaf | TreemapNodeParent;
export type D3TreemapNode = d3.HierarchyNode<TreemapNode>;

/**
 * Converts a nist hash to node data.
 * @param controls The controls to build into a nist node map
 */
function controls_to_nist_node_data(
  controls: Readonly<ContextualizedControl[]>,
  colors: ColorHackModule
): TreemapNodeLeaf[] {
  return controls.map(c => {
    let color = colors.colorForStatus(hdfWrapControl(c.data).status);
    let c_data: TreemapNodeLeaf = {
      title: c.data.id,
      subtitle: c.data.title || undefined,
      hovertext: c.data.desc || undefined,
      key: control_unique_key(c),
      control: c,
      color,
      parent: null
    };
    return c_data;
  });
}

/** Builds a scaffolding for the nist items using the given root.
 * Also constructs a lookup table of control nodes.
 * Only goes max_depth deep.
 */
function recursive_nist_map(
  parent: TreemapNodeParent | null,
  node: Readonly<nist.NistHierarchyNode>,
  control_lookup: { [key: string]: TreemapNodeParent },
  colors: ColorHackModule,
  max_depth: number
): TreemapNodeParent {
  // Init child list
  let children: TreemapNodeParent[] = [];

  // Make our final value
  let ret: TreemapNodeParent = {
    key: node.control.raw_text!,
    title: node.control.raw_text!, // TODO: Make this like, suck less. IE give more descriptive stuff
    nist_control: node.control,
    color: colors.colorForStatus("Empty"),
    parent,
    children
  };

  // Fill our children
  if (node.control.sub_specifiers.length < max_depth) {
    children.push(
      ...node.children.map(c =>
        recursive_nist_map(ret, c, control_lookup, colors, max_depth)
      )
    );
  }

  // Save to lookup
  control_lookup[lookup_key_for(node.control)] = ret;
  return ret;
}

/** Colorizes a treemap based on each nodes children. */
function colorize_tree_map(root: TreemapNodeParent) {
  // First colorize children, recursively
  root.children.forEach(child => {
    if (is_parent(child)) {
      colorize_tree_map(child);
    }
  });

  // Now all children should have valid colors
  // We decide this node's color as a composite of all underlying node colors
  let child_colors = root.children.map(c => c.color);
  if (child_colors.length) {
    // Set the color
    let avg_color = Chroma.average(child_colors);
    root.color = avg_color.hex();
  }
}

/** Generates a lookup key for the given control */
function lookup_key_for(x: NistControl, max_depth?: number): string {
  if (max_depth) {
    return x.sub_specifiers.slice(0, max_depth).join("-");
  } else {
    return x.sub_specifiers.join("-");
  }
}

/** Populates a treemap using the given lookup table */
function populate_tree_map(
  lookup: { [key: string]: TreemapNodeParent },
  leaves: TreemapNodeLeaf[]
) {
  // Populate it
  leaves.forEach(leaf => {
    let nist_controls = hdfWrapControl(leaf.control.data).parsed_nist_tags;
    nist_controls.forEach(control => {
      let parent = lookup[lookup_key_for(control)];
      if (parent) {
        // We found a node that will accept it
        // We can do this as because we know we constructed these to only have empty children
        parent.children.push(leaf);
      } else {
        console.warn(
          `Warning: unable to assign control ${control.raw_text} to valid treemap leaf`
        );
      }
    });
  });
}

/**
 * Assembles the provided leaves into a nist map.
 * Colorizes nodes as appropriate, and assigns parentage
 */
function build_populated_nist_map(
  data: TreemapNodeLeaf[],
  colors: ColorHackModule
): TreemapNodeParent {
  // Build our scaffold
  let lookup: { [key: string]: TreemapNodeParent } = {};
  let root_children: TreemapNodeParent[] = [];
  let root: TreemapNodeParent = {
    key: "tree_root",
    title: "NIST-853 Controls",
    children: root_children,
    color: "TMP", // Doesn't really matter. We never actually see this
    parent: null
  };

  // Fill out children, recursively
  nist.FULL_NIST_HIERARCHY.map(n => {
    let child = recursive_nist_map(root, n, lookup, colors, MAX_DEPTH);
    root_children.push(child);
  });

  // Populate them with leaves
  populate_tree_map(lookup, data);

  // Colorize it
  colorize_tree_map(root);

  // Done
  return root;
}

/**
 * Generates a tree map from the given nist hash, using the size of each category to inversely scale it with controls.
 * Thus each category has a fixed weight!
 * Categories/Families are further sorted by name, and the
 *
 * @param data The nist hash to turn into a tree map
 */
function node_data_to_tree_map(
  data: Readonly<TreemapNodeParent>
): D3TreemapNode {
  let ret = d3
    .hierarchy<TreemapNode>(data, (d: TreemapNode) => {
      if (is_parent(d)) {
        return d.children;
      }
    })
    .sort((a, b) => a.data.title.localeCompare(b.data.title))
    .sum(n => {
      // This value splits the value of this node amidst its siblings
      let split_weight = 1;
      if (n.parent) {
        split_weight = 1 / n.parent.children.length;
      }

      if (is_parent(n)) {
        // Give a minimum weight if has children. Otherwise, give split_weight
        return n.children.length ? 0 : split_weight;
      } else {
        // Evenly split weight between siblings
        return split_weight;
      }
    });
  return ret;
}

/** Does all the steps */
export function build_nist_tree_map(
  data: Readonly<ContextualizedControl[]>,
  colors: ColorHackModule
): D3TreemapNode {
  let leaves = controls_to_nist_node_data(data, colors);
  let b = build_populated_nist_map(leaves, colors);
  let c = node_data_to_tree_map(b);
  return c;
}
