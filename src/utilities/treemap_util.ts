import { HDFControl, NistHash, NistFamily, NistCategory } from "inspecjs";
import * as d3 from "d3";

// The type accepted by d3 treemap functions
export type TreemapDatumType =
  | NistHash
  | NistFamily
  | NistCategory
  | HDFControl;
export type TreemapNode = d3.HierarchyNode<TreemapDatumType>;

// Crappy type checkers; don't expect these to be safe elsewehre
export function isHDFControl(ctrl: TreemapDatumType): ctrl is HDFControl {
  return (ctrl as HDFControl).wraps !== undefined;
}

export function isNistGrouping(
  grp: TreemapDatumType
): grp is NistHash | NistFamily | NistCategory {
  return !isHDFControl(grp);
}

export function nistHashToTreeMap(hash: NistHash): TreemapNode {
  // Build the heirarchy
  let ret = d3
    .hierarchy<TreemapDatumType>(hash, (d: TreemapDatumType) => {
      if (isNistGrouping(d)) {
        return d.children;
      }
    })
    .sort((a, b) => {
      let a_s: string;
      let b_s: string;
      if (isNistGrouping(a.data) && isNistGrouping(b.data)) {
        a_s = a.data.name;
        b_s = b.data.name;
      } else {
        a_s = (a.data as HDFControl).status;
        b_s = (b.data as HDFControl).status;
      }
      return a_s.localeCompare(b_s);
    })
    // Determines the weight of the table
    // We want the families to have a fixed layout, so this is fairly constant
    .sum(d => {
      // Note that these give individual weightings - d3 does the actual summing for us
      if (isNistGrouping(d)) {
        return 1;
      } else {
        return 0;
      }
    });
  return ret;
}
