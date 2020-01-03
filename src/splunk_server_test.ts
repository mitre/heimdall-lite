#!/usr/bin/env node

/** Simple script that tests splunk integration
 */

// Node internals
import { argv, env } from "process";
import fetch, { Headers } from "node-fetch";
import { xml2js, ElementCompact } from "xml-js";
import { delay } from "./utilities/async_util";
import { parse } from "inspecjs";
env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Interfaces
/** The big daddy */
interface AbsMetaInfo {
  // The file this came from
  filename: string;

  // The type of the file (NOT of this event!)
  filetype: "evaluation" | "profile";

  // The subtype
  subtype: "header" | "profile" | "control";

  // A randomly generated GUID capturing all of the events in this file
  guid: string;

  // When this event was parsed
  parse_time: string;

  // The schema version:
  hdf_splunk_schema: string;

  // The sha256 hash of the profile that is/contains this event
  profile_sha256: string;

  // The start time of the control in ISO format
  start_time: string;

  // The control ID, repeated for convenience in splunk searches
  control_id: string;
}

/** The meta information for an event with the "evaluation" subtype */
interface EvaluationMetaInfo
  extends Omit<AbsMetaInfo, "control_id" | "start_time" | "profile_sha256"> {
  subtype: "header";
}

/** The meta information for an event with the "profile" subtype */
interface ProfileMetaInfo
  extends Omit<AbsMetaInfo, "control_id" | "start_time"> {
  subtype: "profile";
}

/** The meta information for an event with the "control" subtype */
interface ControlMetaInfo extends AbsMetaInfo {
  subtype: "control";
}

// Idk if we'll need this
type AnyMeta = EvaluationPayload | ProfilePayload | ControlMetaInfo;

/** This is what we expect to find in every parsed event representing an Evaluation
 * Note that Profiles will typically be initially empty
 */
interface EvaluationPayload {
  meta: EvaluationMetaInfo;
  profiles: ProfilePayload[];
  [x: string]: any;
}

/** This is what we expect to find in every parsed event representing a Profile.
 * Note that controls will typically be initially empty
 */
interface ProfilePayload {
  meta: ProfileMetaInfo;
  controls: ControlPayload[];
  [x: string]: any;
}

/** This is what we expect to find in every parsed event representing a Control */
interface ControlPayload {
  meta: ControlMetaInfo;
  [x: string]: any;
}

// Could be any!
type UnknownPayload = EvaluationPayload | ProfilePayload | ControlPayload;

/* Job states */
type CompleteJobStatus = "succeeded" | "failed";
type PendingJobStatus = "pending";
type JobStatus = CompleteJobStatus | PendingJobStatus;
interface JobState {
  status: JobStatus;
  job_id: string;
}

// Initialize
async function main() {
  var ip = "0.0.0.0";
  var port = 8000;
  if (argv.length > 3) {
    if (argv.length > 1) {
      ip = argv[1];
    }
    if (process.argv.length > 2) {
      port = Number.parseInt(process.argv[2]);
      if (Number.isNaN(port) || port < 1 || port >= 65536) {
        console.error("Error: " + process.argv[2] + " is not a valid port.");
        return;
      }
    }
  }

  // Make the params
  var login = "admin";
  // var password = "strikeconsistpitchalthough";
  var password = "metatronlives";

  let auth_raw = `${login}:${password}`;
  let auth_buff = Buffer.from(auth_raw);
  let auth_b64 = auth_buff.toString("base64");
  let auth_string = `Basic ${auth_b64}`;

  let get_evaluations_search =
    'index="hdf" | spath "meta.subtype" | search "meta.subtype"=header';
  let specific_evaluation = (guid: string) =>
    `index="hdf" | spath "meta.guid" | search "meta.guid"=${guid}`;

  // Find evals, then get execs for each eval
  perform_search(get_evaluations_search, auth_string)
    .then(events => {
      // Because we only searched for headers, we can assume these to be eval events
      let eval_events = events as EvaluationPayload[];

      for (let e of eval_events) {
        console.log(
          `Found eval with guid ${e.meta.guid} and filename ${e.meta.filename}`
        );
      }

      // Did we find any?
      if (!eval_events.length) {
        throw new Error("No evaluations found in this search!");
      }

      // Pick the first one
      let plucked = eval_events[0].meta.guid;

      // Return a search string of it
      let search_string = specific_evaluation(plucked);
      return search_string;
    })
    .then(guid_search => perform_search(guid_search, auth_string))
    .then(events => {
      console.log(`Attempting to consolidate ${events.length} events.`);
      return consolidate_payloads(events);
    })
    .then(full_evaluations => {
      // Get the only item
      let v = full_evaluations[0];

      // Turn it into a report object
      let result: parse.ConversionResult;

      // This is dumb and we should make the inspecjs layer more accepting of many file types
      result = parse.convertFile(JSON.stringify(v));

      // Determine what sort of file we (hopefully) have, then add it
      if (result["1_0_ExecJson"]) {
        // Handle as exec
        let execution = result["1_0_ExecJson"];
        console.log(execution);
        return execution;

        //idk what do with it lmao
        /*
      execution = Object.freeze(execution);
      let reportFile = {
        unique_id: options.unique_id,
        filename: options.filename,
        execution
      };
      data.addExecution(reportFile);
      */
      } else {
        throw new Error("Data somehow wasn't an exec???");
      }
    })
    .catch(console.error);
}

/** Performs the entire process of search string -> results array */
async function perform_search(
  search_string: string,
  auth_string: string
): Promise<UnknownPayload[]> {
  return create_search(search_string, auth_string)
    .then(job_id => pend_job(job_id, auth_string, 500))
    .then(job_state => {
      if (job_state.status === "failed") {
        throw new Error("Search job failed");
      }

      return get_search_results(job_state.job_id, auth_string);
    });
  // .then(results => consolidate_payloads(results));
}

// Returns the job id
async function create_search(
  search_string: string,
  auth_string: string
): Promise<string> {
  return fetch(`https://localhost:8089/services/search/jobs`, {
    method: "POST",
    headers: new Headers({
      Authorization: auth_string
    }),
    body: `search=search ${search_string}`
  })
    .then(response => {
      if (!response.ok) throw new Error(response.status.toString());
      return response.text();
    })
    .then(text => {
      // Parse the xml
      let xml = xml2js(text, {
        compact: true
      }) as ElementCompact;
      return xml.response.sid._text as string;
    });
}

/** Returns the current state of the job */
async function check_job(
  job_id: string,
  auth_string: string
): Promise<JobState> {
  return fetch(`https://localhost:8089/services/search/jobs/${job_id}`, {
    method: "GET",
    headers: new Headers({
      Authorization: auth_string
    })
  })
    .then(response => {
      if (!response.ok) throw new Error(response.status.toString());
      return response.text();
    })
    .then(text => {
      // Parse the xml
      let xml = xml2js(text, {
        compact: true
      }) as ElementCompact;

      // Get the keys, and find the one with name "dispatchState"
      let keys = xml.entry.content["s:dict"]["s:key"];
      let state: string | undefined;
      for (let k of keys) {
        if (k._attributes.name === "dispatchState") {
          state = k._text;
        }
      }

      // Check we found state
      if (!state) {
        throw new Error("Could not resolve job state");
      }

      // Decide result based on state
      let status: JobStatus;
      if (state == "DONE") {
        status = "succeeded";
      } else if (state == "FAILED") {
        status = "failed";
      } else {
        status = "pending";
      }

      // Construct the state
      return {
        status,
        job_id
      };
    });
}

/** Continually checks the job until resolution */
async function pend_job(
  job_id: string,
  auth_string: string,
  interval: number
): Promise<JobState> {
  /* eslint-disable */
    while (true) {
        /* eslint-enable */
    let state = await check_job(job_id, auth_string);
    if (state.status === "pending") {
      await delay(interval);
      continue;
    } else {
      return state;
    }
  }
}

/** Gets the search results for a given job id, if it is done */
async function get_search_results(
  job_id: string,
  auth_string: string
): Promise<UnknownPayload[]> {
  return fetch(
    `https://localhost:8089/services/search/jobs/${job_id}/results/?output_mode=json&count=0`,
    {
      headers: {
        Authorization: auth_string
      },
      method: "GET"
    }
  )
    .then(response => {
      if (!response.ok) throw new Error(response.status.toString());
      return response.json();
    })
    .then(data => {
      // We basically can't, and really shouldn't, do typescript here. Output is 50% guaranteed to be wonk
      // Get all the raws
      let raws: Array<string> = data["results"].map((datum: any) => datum._raw);

      // Parse to json
      let parsed = [] as UnknownPayload[];
      for (let v of raws) {
        try {
          parsed.push(JSON.parse(v) as UnknownPayload);
        } catch (err) {
          console.warn(err);
        }
      }

      return parsed;
    });
}

/** Given: A list of all payloads from a search,
 * Produce: A list of Evaluation payloads containing all data properly reconstructed, recursively, into a "normal"
 * HDF heirarchy
 */
function consolidate_payloads(payloads: UnknownPayload[]): EvaluationPayload[] {
  // Group by exec id
  let grouped = group_by(payloads, pl => pl.meta.guid);

  let built = map_hash(grouped, consolidate_file_payloads);

  return Object.values(built);
}

/** Given: A list of all payloads from a search with the same GUID
 * Produce: A single EvaluationPayload containing all of these payloads reconstructed into the expected HDF heirarchy
 */
function consolidate_file_payloads(
  file_payloads: UnknownPayload[]
): EvaluationPayload {
  // In the end we wish to produce a single evaluation EventPayload which in fact contains all data for the guid
  // Group by subtype
  let subtypes = group_by(file_payloads, event => event.meta.subtype);
  let exec_events = (subtypes["header"] || []) as EvaluationPayload[];
  let profile_events = (subtypes["profile"] || []) as ProfilePayload[];
  let control_events = (subtypes["control"] || []) as ControlPayload[];

  // Verify we only have one exec event
  if (exec_events.length !== 1) {
    throw new Error(
      `Incorrect # of Evaluation events. Expected 1, got ${exec_events.length}`
    );
  }

  // Pull it out
  let exec = exec_events[0];

  // Put all the profiles into the exec
  exec.profiles.push(...profile_events);

  // Group controls, and then put them into the profiles
  let sha_grouped_controls = group_by(
    control_events,
    ctrl => ctrl.meta.profile_sha256
  );
  for (let profile of profile_events) {
    // Get the corresponding controls, and put them into the profile
    let sha = profile.meta.profile_sha256;
    let corr_controls = sha_grouped_controls[sha] || [];
    profile.controls.push(...corr_controls);
  }

  // Spit it back out
  return exec;
}

/**  Converts a simple, single level json dict into uri params */
function to_uri_params(params: { [key: string]: string | number | boolean }) {
  let esc = encodeURIComponent;
  let query = Object.keys(params)
    .map(k => esc(k) + "=" + esc(params[k]))
    .join("&");
  return query;
}

/** Groups items by using the provided key function */
type Hash<T> = { [key: string]: T };
function group_by<T>(
  items: Array<T>,
  key_getter: (v: T) => string
): Hash<Array<T>> {
  let result: Hash<Array<T>> = {};
  for (let i of items) {
    // Get the items key
    let key = key_getter(i);

    // Get the list it should go in
    let corr_list = result[key];
    if (corr_list) {
      // If list exists, place
      corr_list.push(i);
    } else {
      // List does not exist; create and put
      result[key] = [i];
    }
  }
  return result;
}

/** Maps a hash to a new hash, with the same keys but each value replaced with a new (mapped) value */
function map_hash<T, G>(old: Hash<T>, map_function: (v: T) => G): Hash<G> {
  let result: Hash<G> = {};
  for (let key in old) {
    result[key] = map_function(old[key]);
  }
  return result;
}

main();
