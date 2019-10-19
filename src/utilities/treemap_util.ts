/**
 * Tools used for generating the treemaps consumed by, of course, the Treemap card and associated components.
 */

import { HDFControl, hdfWrapControl, ControlStatus, nist } from "inspecjs";
import * as d3 from "d3";
import { ContextualizedControl } from "@/store/data_store";
import { control_unique_key } from "./format_util";
import { NistControl } from "inspecjs/dist/nist";

/**
 * A simple wrapping class needed to facilitate inspecjs nist function usage
 */
/*
export class CCWrapper {
  ctrl: ContextualizedControl;
  hdf: HDFControl;
  category?: nist.NistCategory<CCWrapper>;

  constructor(ctrl: ContextualizedControl) {
    this.ctrl = ctrl;
    this.hdf = hdfWrapControl(ctrl.data);
    this.category = undefined;
  }

  get fixed_nist_tags(): string[] {
    return this.hdf.fixed_nist_tags;
  }

  get status(): ControlStatus {
    return this.hdf.status;
  }
}
*/

/** A simple wrapper type representing what any node's data might be in our treemap */
export interface TreemapNodeParent {
  title: string;
  subtitle?: string;
  hovertext?: string;
  key: string;
  nist_control?: NistControl;
  children: Array<TreemapNodeParent> | Array<TreemapNodeLeaf>;
}

export interface TreemapNodeLeaf {
  title: string;
  subtitle?: string;
  hovertext?: string;
  key: string;
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
  controls: Readonly<ContextualizedControl[]>
): TreemapNodeLeaf[] {
  return controls.map(c => {
    let c_data: TreemapNodeLeaf = {
      title: c.data.id,
      subtitle: c.data.title || undefined,
      hovertext: c.data.desc || undefined,
      key: control_unique_key(c),
      control: c
    };
    return c_data;
  });
}

/** Builds a scaffolding for the nist items using the given root.
 * Also constructs a lookup table of leaf controls
 */
function recursive_nist_map(
  node: Readonly<nist.NistHeirarchyNode>,
  leaf_lookup: { [key: string]: TreemapNodeParent }
): TreemapNodeParent {
  // Make our final value
  let ret = {
    key: node.control.raw_text!,
    title: node.control.raw_text!, // TODO: Make this like, suck less. IE give more descriptive stuff
    children: node.children.map(c => recursive_nist_map(c, leaf_lookup)),
    nist_control: node.control
  };

  // Save to lookup if it's a leaf
  if (node.children.length === 0) {
    leaf_lookup[node.control.raw_text!] = ret;
  }
  return ret;
}

/**
 * Assembles the provided leaves into a nist map.
 */
function build_populated_nist_map(data: TreemapNodeLeaf[]): TreemapNodeParent {
  // Build our scaffold
  let lookup: { [key: string]: TreemapNodeParent } = {};
  let root_children = nist.FULL_NIST_HEIRARCHY.map(n =>
    recursive_nist_map(n, lookup)
  );
  let root: TreemapNodeParent = {
    key: "tree_root",
    title: "NIST-853 Controls",
    children: root_children
  };

  // Populate it
  data.forEach(leaf => {
    let nist_controls = hdfWrapControl(leaf.control.data).fixed_nist_tags;
    nist_controls.forEach(control => {
      let parent = lookup[control.raw_text!];
      if (parent) {
        // We can do this as because we know we constructed these to only have empty children
        (parent.children as TreemapNodeLeaf[]).push(leaf);
      } else {
        console.warn(
          `Warning: unable to assign control ${control.raw_text} to valid treemap leaf`
        );
      }
    });
  });
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
      if (is_parent(n)) {
        return 1e6;
      } else {
        return 1;
      }
    });
  return ret;
}
/*
  // Find the largest count category. We use this to set the weights in individual controls so they fill their parent
  let biggest = 1;
  hash.children.forEach(family => {
    family.children.forEach(category => {
      if (category.count > biggest) {
        biggest = category.count;
      }
    });
  });
  // Convert to hash


  // Build the heirarchy
  let ret = d3.hierarchy<TreemapNodeData>(hash, (d: TreemapDatumType) => {
      if (isNistGrouping(d)) {
        return d.children;
      }
    })
    .sort((a, b) => {
      let a_s: string;
      let b_s: string;
      // If a group, give the name. If a control, give status+name
      if (isNistGrouping(a.data)) {
        a_s = a.data.name;
      } else {
        a_s = a.data.status + a.data.ctrl.data.id;
      }

      //ditto
      if (isNistGrouping(b.data)) {
        b_s = b.data.name;
      } else {
        b_s = b.data.status + b.data.ctrl.data.id;
      }

      return a_s.localeCompare(b_s);
    })
    // Determines the weight of the table
    // We want the families to have a fixed layout, so this is fairly constant
    .sum(d => {
      // Note that these give individual weightings - d3 does the actual summing for us
      if (isNistGrouping(d)) {
        if (d.children.length === 0) {
          // Empty elements given a base size
          return 1;
        } else {
          return 0;
        }
      } else {
        // Controls fill their parent, proportionally
        return 1.0 / d.category!.count;
      }
    });
  return ret;
  */

export function build_nist_tree_map(
  data: Readonly<ContextualizedControl[]>
): D3TreemapNode {
  let a = controls_to_nist_node_data(data);
  let b = build_populated_nist_map(a);
  let c = node_data_to_tree_map(b);
  return c;
}
