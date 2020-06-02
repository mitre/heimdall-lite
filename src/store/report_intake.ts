/**
 * Reads and parses inspec files
 */

import { parse, context } from "inspecjs";
import { Module, VuexModule, getModule, Action } from "vuex-module-decorators";
import DataModule from "@/store/data_store";
import Store from "@/store/store";
import { read_file_async } from "@/utilities/async_util";

/** Each FileID corresponds to a unique File in this store */
export type FileID = number;

/** Represents the minimum data to represent an uploaded file handle. */
export type InspecFile = {
  /**
   * Unique identifier for this file. Used to encode which file is currently selected, etc.
   *
   * Note that in general one can assume that if a file A is loaded AFTER a file B, then
   * A.unique_id > B.unique_id.
   * Using this property, one might order files by order in which they were added.
   */
  unique_id: FileID;
  /** The filename that this file was uploaded under. */
  filename: string;
};

/** Modify our contextual types to sort of have back-linking to sourced from files */
export interface SourcedContextualizedEvaluation
  extends context.ContextualizedEvaluation {
  from_file: EvaluationFile;
}

export interface SourcedContextualizedProfile
  extends context.ContextualizedProfile {
  from_file: ProfileFile;
}

/** Represents a file containing an Inspec Execution output */
export type EvaluationFile = InspecFile & {
  evaluation: SourcedContextualizedEvaluation;
};

/** Represents a file containing an Inspec Profile (not run) */
export type ProfileFile = InspecFile & {
  profile: SourcedContextualizedProfile;
};

export type FileLoadOptions = {
  /** The file to load */
  file: File;

  /** The unique id to grant it */
  unique_id: FileID;
};

export type TextLoadOptions = {
  /** The filename to denote this object with */
  filename: string;

  /** The unique id to grant it */
  unique_id: FileID;

  /** The text to use for it. */
  text: string;
};

@Module({
  namespaced: true,
  dynamic: true,
  store: Store,
  name: "intake"
})
class InspecIntakeModule extends VuexModule {
  /**
   * Load a file with the specified options. Promises an error message on failure
   */
  @Action
  async loadFile(options: FileLoadOptions): Promise<Error | null> {
    let read = read_file_async(options.file);
    return read
      .then(text =>
        this.loadText({
          text,
          unique_id: options.unique_id,
          filename: options.file.name
        })
      )
      .then(err => {
        return err;
      });
  }

  /*
   * Due to issues with catching errors from Actions, this function returns its
   * errors. null implies the text load was successful.
   */
  @Action
  async loadText(options: TextLoadOptions): Promise<Error | null> {
    //console.log("Load Text: " + options.text);
    // Fetch our data store
    const data = getModule(DataModule, Store);

    // Convert it
    let result: parse.ConversionResult;
    try {
      result = parse.convertFile(options.text);
    } catch (e) {
      console.log(
        `Failed to convert file ${options.filename} due to error "${e}".`
      );
      return new Error(
        `Failed to convert file ${options.filename} due to error "${e}".`
      );
    }

    // Determine what sort of file we (hopefully) have, then add it
    if (result["1_0_ExecJson"]) {
      // A bit of chicken and egg here
      let evalFile = {
        unique_id: options.unique_id,
        filename: options.filename
        // evaluation
      } as EvaluationFile;

      // Fixup the evaluation to be Sourced from a file
      let evaluation = (context.contextualizeEvaluation(
        result["1_0_ExecJson"]
      ) as unknown) as SourcedContextualizedEvaluation;
      evaluation.from_file = evalFile;

      // Patch its profiles to point to this new object

      // Set and freeze
      evalFile.evaluation = evaluation;
      Object.freeze(evaluation);
      data.addExecution(evalFile);
    } else if (result["1_0_ProfileJson"]) {
      // Handle as profile
      let profileFile = {
        unique_id: options.unique_id,
        filename: options.filename
      } as ProfileFile;

      let profile: SourcedContextualizedProfile = {
        ...context.contextualizeProfile(result["1_0_ProfileJson"]),
        from_file: profileFile
      };

      // Srt and freeze
      profileFile.profile = profile;
      Object.freeze(profile);

      data.addProfile(profileFile);
    } else {
      console.log("is Nothing");
      return new Error("Couldn't parse data");
    }
    return null;
  }
}

export default InspecIntakeModule;

// Track granted file ids
let last_granted_unique_id: number = 0;

/**
 * Yields a guaranteed currently free file ID.
 * This is the computed as the highest currently held file id + 1
 * It does not "fill spaces" of closed files, so that in any given
 * session we will never repeat a file ID with a different file object.
 */
export function next_free_file_ID(): FileID {
  last_granted_unique_id += 1;
  return last_granted_unique_id;
}
