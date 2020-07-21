/**
 * Provides utlities for comparing executions
 */

import { SourcedContextualizedEvaluation } from "@/store/report_intake";
import { HDFControlSegment, context } from "inspecjs";
import {
  structuredPatch,
  createPatch,
  diffArrays,
  Change as DiffChange,
  diffJson
} from "diff";
import { exec } from "child_process";
import { EvaluationFile } from "@/store/report_intake";
import { getModule } from "vuex-module-decorators";
import { ContextualizedEvaluation } from "inspecjs/dist/context";

/**
 * Represents a change in a property.
 * We assume that the "old" property is the name to use for both.
 * IE that they are the same property value.
 */
export class ControlChange {
  name: string; // the key/title of these values
  values: string[]; // values over controls sorted by time

  /** Trivial constructor */
  constructor(name: string, values: string[]) {
    this.values = values;
    this.name = name;
  }

  /** Checks if this actually changes anything.
   * Returns true iff old !== new
   */
  get valid(): boolean {
    let first_selected = -1;
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i] != "not selected") {
        first_selected = i;
        break;
      }
    }
    if (first_selected == -1) {
      return false;
    }
    for (let i = first_selected + 1; i < this.values.length; i++) {
      if (
        this.values[i] != this.values[first_selected] &&
        this.values[i] != "not selected"
      ) {
        return true;
      }
    }
    return false;
  }
}

/**
 * Represents a group of changes all under one cnosistent named banner.
 */
export class ControlChangeGroup {
  name: string;
  changes: ControlChange[];

  /** Trivial constructor */
  constructor(name: string, changes: ControlChange[]) {
    this.name = name;
    this.changes = changes;
  }

  /** Checks if this has any changes at all. Simple shorthand */
  get any(): boolean {
    return this.changes.length > 0;
  }

  /** Removes any changes if they aren't actually changes */
  clean() {
    this.changes = this.changes.filter(c => c.valid);
  }
}

/** Combines two hashes into a series of changes.
 * If any keys are missing from the first/second, they are treated as the empty string.
 * Note that these "changes" might not necessarily be valid.
 */
function changelog_segments(items: HDFControlSegment[]): ControlChange[] {
  // Get all the keys we care about
  let all_keys: Array<keyof HDFControlSegment>;
  all_keys = ["status", "code_desc", "exception", "message", "resource"]; // determines output order, which are displayed, etc.

  // Map them to changes
  let changes: ControlChange[] = [];
  all_keys.forEach(key => {
    let versions: string[] = items.map(i => i[key] + "" || "");
    changes.push(new ControlChange(key, versions));
  });

  return changes;
}

/**
 * Holds/computes the differences between two runs of the same control.
 */
export class ControlDelta {
  controls: context.ContextualizedControl[] = [];
  controlsandnull: (context.ContextualizedControl | null)[] = [];
  numNull: number = 0;

  constructor(controls: (context.ContextualizedControl | null)[]) {
    this.controlsandnull = controls;
    for (let i = 0; i < controls.length; i++) {
      if (controls[i] === null) {
        this.numNull += 1;
      } else {
        this.controls.push(controls[i]!);
      }
    }
  }

  /* More specific deltas we handle as getters, so that they are only generated on-demand by vue */

  /** Compute the diff in lines-of-code  */
  // get code_changes(): ControlChangeGroup {
  //   let old_code = this.old.data.code || "";
  //   let new_code = this.old.data.code || "";

  //   // Compute the changes in the lines
  //   let line_diff = structuredPatch(
  //     "old_filename",
  //     "new_filename",
  //     old_code,
  //     new_code
  //   );

  //   // Convert them to change objects
  //   let changes: ControlChange[] = line_diff.hunks.map(hunk => {
  //     // Find the original line span
  //     let lines = `line ${hunk.oldStart} - ${hunk.oldStart + hunk.oldLines}`;

  //     // Form the complete chunks
  //     let o = hunk.lines
  //       .filter(l => l[0] !== "+")
  //       .map(l => l.substr(1))
  //       .join("\n");
  //     let n = hunk.lines
  //       .filter(l => l[0] !== "-")
  //       .map(l => l.substr(1))
  //       .join("\n");
  //     return new ControlChange(lines, o, n);
  //   });

  //   // Clean and return the result
  //   let result = new ControlChangeGroup("Code", changes);
  //   result.clean();
  //   return result;
  // }

  /** Returns the changes in "header" elements of a control. E.g. name, status, etc. */
  get header_changes(): ControlChangeGroup {
    // Init the list
    let header_changes: ControlChange[] = [];

    // Change in... ID? Theoretically possible!
    header_changes.push(
      new ControlChange(
        "ID",
        this.controlsandnull.map(c => {
          if (c === null) {
            return "not selected";
          }
          return c!.data.id;
        })
      )
    );

    // Change in status, obviously.
    header_changes.push(
      new ControlChange(
        "Status",
        this.controlsandnull.map(c => {
          if (c === null) {
            return "not selected";
          }
          return c!.hdf.status;
        })
      )
    );

    // And severity! Why not
    header_changes.push(
      new ControlChange(
        "Severity",
        this.controlsandnull.map(c => {
          if (c === null) {
            return "not selected";
          }
          return c!.hdf.severity;
        })
      )
    );

    // Change in nist tags!
    header_changes.push(
      new ControlChange(
        "NIST Tags",
        this.controlsandnull.map(c => {
          if (c === null) {
            return "not selected";
          }
          return c!.hdf.raw_nist_tags.join(", ");
        })
      )
    );

    // Make the group and clean it
    let result = new ControlChangeGroup("Control Details", header_changes);
    result.clean();
    return result;
  }

  /**
   * Get the changes in the controls individual segments.
   * They are returned as a list of change groups, with each group encoding a segment.
   */
  // get segment_changes(): ControlChangeGroup[] {
  //   // Change in individual control segments
  //   let control_segments = this.controls.map(c => {
  //     if (c === null) {
  //       return ["not selected", "not selected", "not selected", "not selected", "not selected"];
  //     }
  //     return c!.root.hdf.segments || [];
  //   });

  //   // Do the actual pairing/diff finging
  //   let results: ControlChangeGroup[] = [];
  //   for (let i = 0; i < control_segments.length; i++) {
  //     let segs = control_segments[i];
  //     let changes = changelog_segments(segs);
  //     let group = new ControlChangeGroup(segs[0].code_desc, changes);

  //     // Clean it up and store if not empty
  //     group.clean();
  //     if (group.any) {
  //       results.push(group);
  //     }
  //   }

  //   return results;
  // }
}

export function get_eval_start_time(
  ev: ContextualizedEvaluation
): string | null {
  for (let prof of ev.contains) {
    for (let ctrl of prof.contains) {
      if (ctrl.hdf.segments!.length) {
        let t = ctrl.hdf.segments![0].start_time;
        return t;
      }
    }
  }
  return null;
}

export function sorted_evals(
  input_evals: Readonly<context.ContextualizedEvaluation[]>
): Readonly<context.ContextualizedEvaluation[]> {
  let evals = [...input_evals];
  evals = evals.sort((a, b) => {
    let a_date = new Date(get_eval_start_time(a) || 0);
    let b_date = new Date(get_eval_start_time(b) || 0);
    return a_date.valueOf() - b_date.valueOf();
  });
  return evals;
}

export function sorted_eval_files(
  files: Readonly<EvaluationFile[]>
): Readonly<EvaluationFile[]> {
  let fileArr = [...files];
  fileArr = fileArr.sort((a, b) => {
    let a_date = new Date(get_eval_start_time(a.evaluation) || 0);
    let b_date = new Date(get_eval_start_time(b.evaluation) || 0);
    return a_date.valueOf() - b_date.valueOf();
  });
  return fileArr;
}

/**
 * Grabs the "top" (IE non-overlayed/end of overlay chain) controls from the execution.
 *
 * @param exec The execution to grab controls from
 */
function extract_top_level_controls(
  exec: context.ContextualizedEvaluation
): context.ContextualizedControl[] {
  // Get all controls
  let all_controls = exec.contains.flatMap(p => p.contains);

  // Filter to controls that aren't overlayed further
  let top = all_controls.filter(control => control.extended_by.length === 0);
  return top;
}
/** An array of contextualized controls with the same ID, sorted by time */
export type ControlSeries = Array<context.ContextualizedControl | null>;

/** Matches ControlID keys to Arrays of Controls, sorted by time */
export type ControlSeriesLookup = { [key: string]: ControlSeries };

/** Helps manage comparing change(s) between one or more profile executions */
export class ComparisonContext {
  /** A list of old-new control pairings */
  pairings: ControlSeriesLookup;

  constructor(executions: readonly context.ContextualizedEvaluation[]) {
    // Get all of the "top level" controls from each execution, IE those that actually ran
    let all_controls = executions.flatMap(extract_top_level_controls);

    // Organize them by ID
    let matched: ControlSeriesLookup = {};
    for (let ctrl of all_controls) {
      let id = ctrl.data.id;
      if (!(id in matched)) {
        matched[id] = [];
      }
    }
    let sorted_eval: Readonly<context.ContextualizedEvaluation[]> = sorted_evals(
      executions
    );
    for (let ev of sorted_eval) {
      let ev_controls_by_id: {
        [k: string]: context.ContextualizedControl;
      } = {};
      for (let prof of ev.contains) {
        for (let ctrl of prof.contains) {
          if (ctrl.root == ctrl) {
            ev_controls_by_id[ctrl.data.id] = ctrl;
          }
        }
      }
      for (let id of Object.keys(matched)) {
        if (id in ev_controls_by_id) {
          matched[id].push(ev_controls_by_id[id]);
        } else {
          matched[id].push(null);
        }
      }
    }
    // Store
    this.pairings = matched;
  }
}
