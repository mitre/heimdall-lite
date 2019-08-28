/**
 * Provides utlities for comparing executions
 */

import {
  ContextualizedExecution,
  ContextualizedControl
} from "@/store/data_store";
import { hdfWrapControl, HDFControl } from "inspecjs";
import { diffLines, diffArrays, Change } from "diff";

export class ControlDelta {
  /** The older control */
  old: ContextualizedControl;

  /** The newer control */
  new: ContextualizedControl;

  /** The older control, conveniently bundles as an hdf */
  get old_hdf(): HDFControl {
    return hdfWrapControl(this.old.data);
  }

  /** The newer control, conveniently bundles as an hdf */
  get new_hdf(): HDFControl {
    return hdfWrapControl(this.new.data);
  }

  /** Whether or not the status changed */
  readonly status_changed: boolean;

  constructor(old: ContextualizedControl, _new: ContextualizedControl) {
    this.old = old;
    this.new = _new;

    let old_status = hdfWrapControl(this.old.data).status;
    let new_status = hdfWrapControl(this.new.data).status;
    this.status_changed = old_status !== new_status;
  }

  /* More specific deltas we handle as getters, so that they are only generated on-demand by vue */
  get delta_code(): Change[] {
    return diffLines(this.old.data.code, this.new.data.code);
  }

  /** Returns the delta between the status lists in old vs new. Returns null if status lists cannot be obtained */
  get delta_results(): null {
    console.warn("delta_results is not yet implemented!");
    let old_results = hdfWrapControl(this.old.data).status_list;
    let new_results = hdfWrapControl(this.new.data).status_list;
    if (old_results === undefined || new_results === undefined) {
      return null;
    }
    return null;
    // return diffArrays(old_results[0].
  }
}

function extract_top_level_controls(exec: ContextualizedExecution) {
  // Get all controls
  let all_controls = exec.contains.flatMap(p => p.contains);

  // Filter to controls that aren't overlayed further
  let top = all_controls.filter(control => control.extended_by.length === 0);
  return top;
}

export class ExecDelta {
  /** A list of old-new control pairings */
  pairs: ControlDelta[];

  /** An array of all controls from the older exec that weren't matched */
  unmatched_old: ContextualizedControl[];

  /** An array of all controls from the newer exec that weren't matched */
  unmatched_new: ContextualizedControl[];

  constructor(
    old_exec: ContextualizedExecution,
    new_exec: ContextualizedExecution
  ) {
    // Get all of the "top level" controls from each execution
    let old_controls = extract_top_level_controls(old_exec);
    let new_controls = extract_top_level_controls(new_exec);

    // Pair em up
    this.pairs = [];
    this.unmatched_old = [];
    old_controls.some(old_control => {
      // We use some instead of foreach both for early-exit and to tell us if any succeeded
      let found = new_controls.some((new_control, new_index) => {
        // If find a pairing, break from inner loop
        if (old_control.data.id === new_control.data.id) {
          // Add to pairs
          this.pairs.push(new ControlDelta(old_control, new_control));

          // Remove from new
          new_controls.splice(new_index);

          // Mark success
          found = true;
          return true;
        } else {
          return false;
        }
      });

      // If completed inner loop without pairing, add to unmatched
      if (!found) {
        this.unmatched_old.push(old_control);
      }
    });

    // Within the loop we added all old controls we could not match.
    // Now, we do the same for new. Luckily, we've been taking out the matched from new_controls
    this.unmatched_new = new_controls;
  }
}
