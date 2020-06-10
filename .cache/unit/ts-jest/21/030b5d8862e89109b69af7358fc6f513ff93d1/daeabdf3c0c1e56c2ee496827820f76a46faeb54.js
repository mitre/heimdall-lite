"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml_js_1 = require("xml-js");
const async_util_1 = require("./async_util");
const inspecjs_1 = require("inspecjs");
const helper_util_1 = require("./helper_util");
/** This info is used to negotiate splunk connections */
class SplunkEndpoint {
    constructor(host, username, password) {
        this.host = host;
        this.username = username;
        this.password = password;
    }
    /** Checks whether we're able to successfully get jobs,
     * which indicates proper auth.
     *
     * Will error if we aren't
     */
    async check_auth() {
        return fetch(`${this.host}/services/search/jobs`, {
            headers: {
                Authorization: this.auth_string
            },
            method: "GET"
        }).then(response => {
            if (!response.ok) {
                throw process_error(response);
            }
        }, failure => {
            throw process_error(failure);
        });
    }
    /** Provides a list of Evaluation meta headers from recent executions.
     * We should eventually change this to allow more specific criteria
     */
    async fetch_execution_list() {
        // This search lists evaluation headers
        let get_executions_search = 'spath "meta.subtype" | search "meta.subtype"=header';
        return this.hdf_event_search(get_executions_search).then(events => {
            // Because we only searched for headers, we can assume these to be eval events
            let eval_events = events;
            // Could perhaps just return e but I'd rather people didn't screw themselves
            return eval_events.map(e => e.meta);
        });
    }
    async get_execution_events(execution_guid) {
        // This search, provided a guid, returns all headers for that guid
        let specific_evaluation = `spath "meta.guid" | search "meta.guid"=${execution_guid}`;
        return this.hdf_event_search(specific_evaluation);
    }
    async get_execution(execution_guid) {
        return this.get_execution_events(execution_guid)
            .then(events => consolidate_payloads(events))
            .then(execs => {
            if (execs.length != 1) {
                throw SplunkErrorCode.InvalidGUID;
            }
            else {
                return execs[0];
            }
        })
            .then(full_event => {
            // This is dumb and we should make the inspecjs layer more accepting of many file types
            let result;
            try {
                result = inspecjs_1.parse.convertFile(JSON.stringify(full_event));
            }
            catch (e) {
                throw SplunkErrorCode.SchemaViolation;
            }
            // Determine what sort of file we (hopefully) have, then add it
            if (result["1_0_ExecJson"]) {
                // Handle as exec
                let execution = result["1_0_ExecJson"];
                return execution;
            }
            else {
                throw SplunkErrorCode.SchemaViolation;
            }
        });
    }
    /** Creates a proper base64 encoded auth string, using this objects credentials. */
    get auth_string() {
        let auth_string = helper_util_1.basic_auth(this.username, this.password);
        return auth_string;
    }
    /** Performs the entire process of search string -> results array
     *  Performs no consolidation.
     *  Assumes your search string is properly constrained to the hdf index
     */
    async hdf_event_search(search_string) {
        return this.create_search(search_string)
            .then(job_id => this.pend_job(job_id, 500))
            .then(job_state => {
            if (job_state.status === "failed") {
                throw SplunkErrorCode.SearchFailed;
            }
            return this.get_search_results(job_state.job_id);
        })
            .catch(error => {
            throw process_error(error);
        });
    }
    /** Returns the job id */
    async create_search(search_string) {
        return fetch(`${this.host}/services/search/jobs`, {
            method: "POST",
            headers: new Headers({
                Authorization: this.auth_string
            }),
            body: `search=search index="hdf" | ${search_string}`
        })
            .then(response => {
            if (!response.ok)
                throw process_error(response);
            return response.text();
        })
            .then(text => {
            // Parse the xml
            let xml = xml_js_1.xml2js(text, {
                compact: true
            });
            return xml.response.sid._text;
        });
    }
    /** Returns the current state of the job */
    async check_job(job_id) {
        return fetch(`${this.host}/services/search/jobs/${job_id}`, {
            method: "GET",
            headers: new Headers({
                Authorization: this.auth_string
            })
        })
            .then(response => {
            if (!response.ok)
                throw process_error(response);
            return response.text();
        })
            .then(text => {
            // Parse the xml
            let xml = xml_js_1.xml2js(text, {
                compact: true
            });
            // Get the keys, and find the one with name "dispatchState"
            let keys = xml.entry.content["s:dict"]["s:key"];
            let state;
            for (let k of keys) {
                if (k._attributes.name === "dispatchState") {
                    state = k._text;
                }
            }
            // Check we found state
            if (!state) {
                // It probably failed if we can't find it lol
                state = "FAILED";
            }
            // Decide result based on state
            let status;
            if (state == "DONE") {
                status = "succeeded";
            }
            else if (state == "FAILED") {
                status = "failed";
            }
            else {
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
    async pend_job(job_id, interval) {
        /* eslint-disable */
        while (true) {
            /* eslint-enable */
            let state = await this.check_job(job_id);
            if (state.status === "pending") {
                await async_util_1.delay(interval);
                continue;
            }
            else {
                return state;
            }
        }
    }
    /** Gets the search results for a given job id, if it is done */
    async get_search_results(job_id) {
        return fetch(`${this.host}/services/search/jobs/${job_id}/results/?output_mode=json&count=0`, {
            headers: {
                Authorization: this.auth_string
            },
            method: "GET"
        })
            .then(response => {
            if (!response.ok)
                throw process_error(response);
            return response.json();
        })
            .then(data => {
            // We basically can't, and really shouldn't, do typescript here. Output is 50% guaranteed to be wonk
            // Get all the raws
            let raws = data["results"].map((datum) => datum._raw);
            // Parse to json, and freeze
            let parsed = [];
            for (let v of raws) {
                try {
                    parsed.push(JSON.parse(v));
                }
                catch (err) {
                    console.warn(err);
                }
            }
            return parsed;
        });
    }
}
exports.SplunkEndpoint = SplunkEndpoint;
/** Given: A list of all payloads from a search,
 * Produce: A list of Evaluation payloads containing all data properly reconstructed, recursively, into a "normal"
 * HDF heirarchy.
 *
 * TODO: Provide a mechanism for also returning orphaned items
 */
function consolidate_payloads(payloads) {
    // Group by exec id
    let grouped = helper_util_1.group_by(payloads, pl => pl.meta.guid);
    let built = helper_util_1.map_hash(grouped, consolidate_file_payloads);
    return Object.values(built);
}
exports.consolidate_payloads = consolidate_payloads;
/** Given: A list of all payloads from a search with the same GUID
 * Produce: A single EvaluationPayload containing all of these payloads reconstructed into the expected HDF heirarchy
 */
function consolidate_file_payloads(file_payloads) {
    // In the end we wish to produce a single evaluation EventPayload which in fact contains all data for the guid
    // Group by subtype
    let subtypes = helper_util_1.group_by(file_payloads, event => event.meta.subtype);
    let exec_events = (subtypes["header"] || []);
    let profile_events = (subtypes["profile"] || []);
    let control_events = (subtypes["control"] || []);
    // Verify we only have one exec event
    if (exec_events.length !== 1) {
        throw new Error(`Incorrect # of Evaluation events. Expected 1, got ${exec_events.length}`);
    }
    // Pull it out
    let exec = exec_events[0];
    // Put all the profiles into the exec
    exec.profiles.push(...profile_events);
    // Group controls, and then put them into the profiles
    let sha_grouped_controls = helper_util_1.group_by(control_events, ctrl => ctrl.meta.profile_sha256);
    for (let profile of profile_events) {
        // Get the corresponding controls, and put them into the profile
        let sha = profile.meta.profile_sha256;
        let corr_controls = sha_grouped_controls[sha] || [];
        profile.controls.push(...corr_controls);
    }
    // Spit it back out
    return exec;
}
var SplunkErrorCode;
(function (SplunkErrorCode) {
    SplunkErrorCode[SplunkErrorCode["BadNetwork"] = 0] = "BadNetwork";
    SplunkErrorCode[SplunkErrorCode["BadUrl"] = 1] = "BadUrl";
    SplunkErrorCode[SplunkErrorCode["PageNotFound"] = 2] = "PageNotFound";
    SplunkErrorCode[SplunkErrorCode["BadAuth"] = 3] = "BadAuth";
    SplunkErrorCode[SplunkErrorCode["SearchFailed"] = 4] = "SearchFailed";
    SplunkErrorCode[SplunkErrorCode["ConsolidationFailed"] = 5] = "ConsolidationFailed";
    SplunkErrorCode[SplunkErrorCode["SchemaViolation"] = 6] = "SchemaViolation";
    SplunkErrorCode[SplunkErrorCode["InvalidGUID"] = 7] = "InvalidGUID";
    SplunkErrorCode[SplunkErrorCode["UnknownError"] = 8] = "UnknownError"; // No clue!
})(SplunkErrorCode = exports.SplunkErrorCode || (exports.SplunkErrorCode = {}));
/** Converts Responses and Errorcodes into purely just errorcodes */
function process_error(r) {
    console.warn("Got error in splunk operations");
    console.warn(r);
    if (r instanceof TypeError) {
        console.warn("Typeerror");
        if (r.message.includes("NetworkError")) {
            return SplunkErrorCode.BadNetwork;
        }
        else if (r.message.includes("not a valid URL")) {
            return SplunkErrorCode.BadUrl;
        }
    }
    else if (r instanceof Response) {
        console.warn("Bad Response");
        // Based on the network code, guess
        let response = r;
        switch (response.status) {
            case 401: // Bad username/password
                return SplunkErrorCode.BadAuth;
            case 404: // URL got borked
                return SplunkErrorCode.PageNotFound;
            default:
                console.log("Unsure how to handle error " + response.status);
                return SplunkErrorCode.UnknownError;
        }
    }
    else if (typeof r === typeof SplunkErrorCode.UnknownError) {
        // It's already an error code - pass along
        console.warn("SplunkErrorCode");
        return r;
    }
    // idk lol
    return SplunkErrorCode.UnknownError;
}
exports.process_error = process_error;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL3Nqb3NoaS90ZXN0L2hlaW1kYWxsLWxpdGUvc3JjL3V0aWxpdGllcy9zcGx1bmtfdXRpbC50cyIsIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFnRDtBQUNoRCw2Q0FBcUM7QUFDckMsdUNBQWlDO0FBQ2pDLCtDQUFxRTtBQTJGckUsd0RBQXdEO0FBQ3hELE1BQWEsY0FBYztJQVl6QixZQUFZLElBQVksRUFBRSxRQUFnQixFQUFFLFFBQWdCO1FBQzFELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFVBQVU7UUFDZCxPQUFPLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLHVCQUF1QixFQUFFO1lBQ2hELE9BQU8sRUFBRTtnQkFDUCxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVc7YUFDaEM7WUFDRCxNQUFNLEVBQUUsS0FBSztTQUNkLENBQUMsQ0FBQyxJQUFJLENBQ0wsUUFBUSxDQUFDLEVBQUU7WUFDVCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRTtnQkFDaEIsTUFBTSxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDL0I7UUFDSCxDQUFDLEVBQ0QsT0FBTyxDQUFDLEVBQUU7WUFDUixNQUFNLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxvQkFBb0I7UUFDeEIsdUNBQXVDO1FBQ3ZDLElBQUkscUJBQXFCLEdBQ3ZCLHFEQUFxRCxDQUFDO1FBRXhELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2hFLDhFQUE4RTtZQUM5RSxJQUFJLFdBQVcsR0FBRyxNQUE0QixDQUFDO1lB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QyxZQUFZLFFBQVEsRUFBRTtRQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzdCLG1DQUFtQztRQUNuQyxJQUFJLFFBQVEsR0FBRyxDQUFhLENBQUM7UUFDN0IsUUFBUSxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQ3ZCLEtBQUssR0FBRyxFQUFFLHdCQUF3QjtnQkFDaEMsT0FBTyxlQUFlLENBQUMsT0FBTyxDQUFDO1lBQ2pDLEtBQUssR0FBRyxFQUFFLGlCQUFpQjtnQkFDekIsT0FBTyxlQUFlLENBQUMsWUFBWSxDQUFDO1lBQ3RDO2dCQUNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM3RCxPQUFPLGVBQWUsQ0FBQyxZQUFZLENBQUM7U0FDdkM7S0FDRjtTQUFNLElBQUksT0FBTyxDQUFDLEtBQUssT0FBTyxlQUFlLENBQUMsWUFBWSxFQUFFO1FBQzNELDBDQUEwQztRQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDaEMsT0FBTyxDQUFDLENBQUM7S0FDVjtJQUNELFVBQVU7SUFDVixPQUFPLGVBQWUsQ0FBQyxZQUFZLENBQUM7QUFDdEMsQ0FBQztBQWhDRCxzQ0FnQ0MiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL3Nqb3NoaS90ZXN0L2hlaW1kYWxsLWxpdGUvc3JjL3V0aWxpdGllcy9zcGx1bmtfdXRpbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB4bWwyanMsIEVsZW1lbnRDb21wYWN0IH0gZnJvbSBcInhtbC1qc1wiO1xuaW1wb3J0IHsgZGVsYXkgfSBmcm9tIFwiLi9hc3luY191dGlsXCI7XG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gXCJpbnNwZWNqc1wiO1xuaW1wb3J0IHsgSGFzaCwgZ3JvdXBfYnksIG1hcF9oYXNoLCBiYXNpY19hdXRoIH0gZnJvbSBcIi4vaGVscGVyX3V0aWxcIjtcbmltcG9ydCB7IHNjaGVtYXNfMV8wIH0gZnJvbSBcImluc3BlY2pzXCI7XG5cbi8vIGVudi5OT0RFX1RMU19SRUpFQ1RfVU5BVVRIT1JJWkVEID0gXCIwXCI7XG5cbmV4cG9ydCB0eXBlIEpvYklEID0gc3RyaW5nO1xuXG4vLyBJbnRlcmZhY2VzXG4vKiogVGhlIHBhcmVudCB0eXBlIHRvIG90aGVyIGludGVyZmFjZXMsIHRvIHNhdmUgZHVwbGljYXRpb24gKi9cbmludGVyZmFjZSBBYnNNZXRhSW5mbyB7XG4gIC8qKiBUaGUgZmlsZSB0aGlzIGNhbWUgZnJvbSAqL1xuICBmaWxlbmFtZTogc3RyaW5nO1xuXG4gIC8qKiBUaGUgdHlwZSBvZiB0aGUgZmlsZSAoTk9UIG9mIHRoaXMgZXZlbnQhKSAqL1xuICBmaWxldHlwZTogXCJldmFsdWF0aW9uXCIgfCBcInByb2ZpbGVcIjtcblxuICAvKiogVGhlIHN1YnR5cGUgb2YgdGhpcyBzcGVjaWZpYyBldmVudCAqL1xuICBzdWJ0eXBlOiBcImhlYWRlclwiIHwgXCJwcm9maWxlXCIgfCBcImNvbnRyb2xcIjtcblxuICAvKiogQSByYW5kb21seSBnZW5lcmF0ZWQgR1VJRCBjYXB0dXJpbmcgYWxsIG9mIHRoZSBldmVudHMgaW4gdGhpcyBmaWxlICovXG4gIGd1aWQ6IHN0cmluZztcblxuICAvKiogV2hlbiB0aGlzIGV2ZW50IHdhcyBwYXJzZWQgKi9cbiAgcGFyc2VfdGltZTogc3RyaW5nO1xuXG4gIC8qKiBUaGUgc2NoZW1hIHZlcnNpb246ICovXG4gIGhkZl9zcGx1bmtfc2NoZW1hOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSBzaGEyNTYgaGFzaCBvZiB0aGUgcHJvZmlsZSB0aGF0IGlzL2NvbnRhaW5zIHRoaXMgZXZlbnQgKi9cbiAgcHJvZmlsZV9zaGEyNTY6IHN0cmluZztcblxuICAvKiogVGhlIHN0YXJ0IHRpbWUgb2YgdGhlIGNvbnRyb2wgaW4gSVNPIGZvcm1hdCAqL1xuICBzdGFydF90aW1lOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSBjb250cm9sIElELCByZXBlYXRlZCBmb3IgY29udmVuaWVuY2UgaW4gc3BsdW5rIHNlYXJjaGVzICovXG4gIGNvbnRyb2xfaWQ6IHN0cmluZztcbn1cblxuLyoqIFRoZSBtZXRhIGluZm9ybWF0aW9uIGZvciBhbiBldmVudCB3aXRoIHRoZSBcImV2YWx1YXRpb25cIiBzdWJ0eXBlICovXG5leHBvcnQgaW50ZXJmYWNlIEV4ZWN1dGlvbk1ldGFJbmZvXG4gIGV4dGVuZHMgT21pdDxBYnNNZXRhSW5mbywgXCJjb250cm9sX2lkXCIgfCBcInN0YXJ0X3RpbWVcIiB8IFwicHJvZmlsZV9zaGEyNTZcIj4ge1xuICBzdWJ0eXBlOiBcImhlYWRlclwiO1xufVxuXG4vKiogVGhlIG1ldGEgaW5mb3JtYXRpb24gZm9yIGFuIGV2ZW50IHdpdGggdGhlIFwicHJvZmlsZVwiIHN1YnR5cGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHJvZmlsZU1ldGFJbmZvXG4gIGV4dGVuZHMgT21pdDxBYnNNZXRhSW5mbywgXCJjb250cm9sX2lkXCIgfCBcInN0YXJ0X3RpbWVcIj4ge1xuICBzdWJ0eXBlOiBcInByb2ZpbGVcIjtcbn1cblxuLyoqIFRoZSBtZXRhIGluZm9ybWF0aW9uIGZvciBhbiBldmVudCB3aXRoIHRoZSBcImNvbnRyb2xcIiBzdWJ0eXBlICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRyb2xNZXRhSW5mbyBleHRlbmRzIEFic01ldGFJbmZvIHtcbiAgc3VidHlwZTogXCJjb250cm9sXCI7XG59XG5cbi8qKiBUaGlzIGlzIHdoYXQgd2UgZXhwZWN0IHRvIGZpbmQgaW4gZXZlcnkgcGFyc2VkIGV2ZW50IHJlcHJlc2VudGluZyBhbiBFdmFsdWF0aW9uXG4gKiBOb3RlIHRoYXQgUHJvZmlsZXMgd2lsbCB0eXBpY2FsbHkgYmUgaW5pdGlhbGx5IGVtcHR5XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhlY3V0aW9uUGF5bG9hZCB7XG4gIG1ldGE6IEV4ZWN1dGlvbk1ldGFJbmZvO1xuICBwcm9maWxlczogUHJvZmlsZVBheWxvYWRbXTtcbiAgW3g6IHN0cmluZ106IGFueTtcbn1cblxuLyoqIFRoaXMgaXMgd2hhdCB3ZSBleHBlY3QgdG8gZmluZCBpbiBldmVyeSBwYXJzZWQgZXZlbnQgcmVwcmVzZW50aW5nIGEgUHJvZmlsZS5cbiAqIE5vdGUgdGhhdCBjb250cm9scyB3aWxsIHR5cGljYWxseSBiZSBpbml0aWFsbHkgZW1wdHlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQcm9maWxlUGF5bG9hZCB7XG4gIG1ldGE6IFByb2ZpbGVNZXRhSW5mbztcbiAgY29udHJvbHM6IENvbnRyb2xQYXlsb2FkW107XG4gIFt4OiBzdHJpbmddOiBhbnk7XG59XG5cbi8qKiBUaGlzIGlzIHdoYXQgd2UgZXhwZWN0IHRvIGZpbmQgaW4gZXZlcnkgcGFyc2VkIGV2ZW50IHJlcHJlc2VudGluZyBhIENvbnRyb2wgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udHJvbFBheWxvYWQge1xuICBtZXRhOiBDb250cm9sTWV0YUluZm87XG4gIFt4OiBzdHJpbmddOiBhbnk7XG59XG5cbi8vIENvdWxkIGJlIGFueSFcbmV4cG9ydCB0eXBlIFVua25vd25QYXlsb2FkID0gRXhlY3V0aW9uUGF5bG9hZCB8IFByb2ZpbGVQYXlsb2FkIHwgQ29udHJvbFBheWxvYWQ7XG5cbi8qIEpvYiBzdGF0ZXMgKi9cbnR5cGUgQ29tcGxldGVKb2JTdGF0dXMgPSBcInN1Y2NlZWRlZFwiIHwgXCJmYWlsZWRcIjtcbnR5cGUgUGVuZGluZ0pvYlN0YXR1cyA9IFwicGVuZGluZ1wiOyAvLyBUaGVyZSBhcmUgb3RoZXJzLCBidXQgd2UgZG9uJ3QgaGFuZGxlIHRoZW0gZm9yIG5vd1xudHlwZSBKb2JTdGF0dXMgPSBDb21wbGV0ZUpvYlN0YXR1cyB8IFBlbmRpbmdKb2JTdGF0dXM7XG5pbnRlcmZhY2UgSm9iU3RhdGUge1xuICBzdGF0dXM6IEpvYlN0YXR1cztcbiAgam9iX2lkOiBKb2JJRDtcbn1cblxuLyoqIFRoaXMgaW5mbyBpcyB1c2VkIHRvIG5lZ290aWF0ZSBzcGx1bmsgY29ubmVjdGlvbnMgKi9cbmV4cG9ydCBjbGFzcyBTcGx1bmtFbmRwb2ludCB7XG4gIC8qKiBUaGUgZnVsbCBob3N0IGluZm9ybWF0aW9uLCBpbmNsdWRpbmcgcG9ydCAodHlwaWNhbGx5IDgwODkpLlxuICAgKiBFWDogaHR0cHM6Ly9sb2NhbGhvc3Q6ODA4OVxuICAgKi9cbiAgaG9zdDogc3RyaW5nO1xuXG4gIC8qKiBVc2VybmFtZSB0byB1c2UgZm9yIGF1dGhlbnRpY2F0aW9uICovXG4gIHVzZXJuYW1lOiBzdHJpbmc7XG5cbiAgLyoqIFBhc3N3b3JkIHRvIHVzZSBmb3IgYXV0aGVudGljYXRpb24gKi9cbiAgcGFzc3dvcmQ6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihob3N0OiBzdHJpbmcsIHVzZXJuYW1lOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpIHtcbiAgICB0aGlzLmhvc3QgPSBob3N0O1xuICAgIHRoaXMudXNlcm5hbWUgPSB1c2VybmFtZTtcbiAgICB0aGlzLnBhc3N3b3JkID0gcGFzc3dvcmQ7XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgd2UncmUgYWJsZSB0byBzdWNjZXNzZnVsbHkgZ2V0IGpvYnMsXG4gICAqIHdoaWNoIGluZGljYXRlcyBwcm9wZXIgYXV0aC5cbiAgICpcbiAgICogV2lsbCBlcnJvciBpZiB3ZSBhcmVuJ3RcbiAgICovXG4gIGFzeW5jIGNoZWNrX2F1dGgoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIGZldGNoKGAke3RoaXMuaG9zdH0vc2VydmljZXMvc2VhcmNoL2pvYnNgLCB7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIEF1dGhvcml6YXRpb246IHRoaXMuYXV0aF9zdHJpbmdcbiAgICAgIH0sXG4gICAgICBtZXRob2Q6IFwiR0VUXCJcbiAgICB9KS50aGVuKFxuICAgICAgcmVzcG9uc2UgPT4ge1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgdGhyb3cgcHJvY2Vzc19lcnJvcihyZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmYWlsdXJlID0+IHtcbiAgICAgICAgdGhyb3cgcHJvY2Vzc19lcnJvcihmYWlsdXJlKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgLyoqIFByb3ZpZGVzIGEgbGlzdCBvZiBFdmFsdWF0aW9uIG1ldGEgaGVhZGVycyBmcm9tIHJlY2VudCBleGVjdXRpb25zLlxuICAgKiBXZSBzaG91bGQgZXZlbnR1YWxseSBjaGFuZ2UgdGhpcyB0byBhbGxvdyBtb3JlIHNwZWNpZmljIGNyaXRlcmlhXG4gICAqL1xuICBhc3luYyBmZXRjaF9leGVjdXRpb25fbGlzdCgpOiBQcm9taXNlPEV4ZWN1dGlvbk1ldGFJbmZvW10+IHtcbiAgICAvLyBUaGlzIHNlYXJjaCBsaXN0cyBldmFsdWF0aW9uIGhlYWRlcnNcbiAgICBsZXQgZ2V0X2V4ZWN1dGlvbnNfc2VhcmNoID1cbiAgICAgICdzcGF0aCBcIm1ldGEuc3VidHlwZVwiIHwgc2VhcmNoIFwibWV0YS5zdWJ0eXBlXCI9aGVhZGVyJztcblxuICAgIHJldHVybiB0aGlzLmhkZl9ldmVudF9zZWFyY2goZ2V0X2V4ZWN1dGlvbnNfc2VhcmNoKS50aGVuKGV2ZW50cyA9PiB7XG4gICAgICAvLyBCZWNhdXNlIHdlIG9ubHkgc2VhcmNoZWQgZm9yIGhlYWRlcnMsIHdlIGNhbiBhc3N1bWUgdGhlc2UgdG8gYmUgZXZhbCBldmVudHNcbiAgICAgIGxldCBldmFsX2V2ZW50cyA9IGV2ZW50cyBhcyBFeGVjdXRpb25QYXlsb2FkW107XG5cbiAgICAgIC8vIENvdWxkIHBlcmhhcHMganVzdCByZXR1cm4gZSBidXQgSSdkIHJhdGhlciBwZW9wbGUgZGlkbid0IHNjcmV3IHRoZW1zZWx2ZXNcbiAgICAgIHJldHVybiBldmFsX2V2ZW50cy5tYXAoZSA9PiBlLm1ldGEpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZ2V0X2V4ZWN1dGlvbl9ldmVudHMoXG4gICAgZXhlY3V0aW9uX2d1aWQ6IHN0cmluZ1xuICApOiBQcm9taXNlPFVua25vd25QYXlsb2FkW10+IHtcbiAgICAvLyBUaGlzIHNlYXJjaCwgcHJvdmlkZWQgYSBndWlkLCByZXR1cm5zIGFsbCBoZWFkZXJzIGZvciB0aGF0IGd1aWRcbiAgICBsZXQgc3BlY2lmaWNfZXZhbHVhdGlvbiA9IGBzcGF0aCBcIm1ldGEuZ3VpZFwiIHwgc2VhcmNoIFwibWV0YS5ndWlkXCI9JHtleGVjdXRpb25fZ3VpZH1gO1xuICAgIHJldHVybiB0aGlzLmhkZl9ldmVudF9zZWFyY2goc3BlY2lmaWNfZXZhbHVhdGlvbik7XG4gIH1cblxuICBhc3luYyBnZXRfZXhlY3V0aW9uKFxuICAgIGV4ZWN1dGlvbl9ndWlkOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxzY2hlbWFzXzFfMC5FeGVjSlNPTi5FeGVjdXRpb24+IHtcbiAgICByZXR1cm4gdGhpcy5nZXRfZXhlY3V0aW9uX2V2ZW50cyhleGVjdXRpb25fZ3VpZClcbiAgICAgIC50aGVuKGV2ZW50cyA9PiBjb25zb2xpZGF0ZV9wYXlsb2FkcyhldmVudHMpKVxuICAgICAgLnRoZW4oZXhlY3MgPT4ge1xuICAgICAgICBpZiAoZXhlY3MubGVuZ3RoICE9IDEpIHtcbiAgICAgICAgICB0aHJvdyBTcGx1bmtFcnJvckNvZGUuSW52YWxpZEdVSUQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGV4ZWNzWzBdO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVsbF9ldmVudCA9PiB7XG4gICAgICAgIC8vIFRoaXMgaXMgZHVtYiBhbmQgd2Ugc2hvdWxkIG1ha2UgdGhlIGluc3BlY2pzIGxheWVyIG1vcmUgYWNjZXB0aW5nIG9mIG1hbnkgZmlsZSB0eXBlc1xuICAgICAgICBsZXQgcmVzdWx0OiBwYXJzZS5Db252ZXJzaW9uUmVzdWx0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3VsdCA9IHBhcnNlLmNvbnZlcnRGaWxlKEpTT04uc3RyaW5naWZ5KGZ1bGxfZXZlbnQpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHRocm93IFNwbHVua0Vycm9yQ29kZS5TY2hlbWFWaW9sYXRpb247XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hhdCBzb3J0IG9mIGZpbGUgd2UgKGhvcGVmdWxseSkgaGF2ZSwgdGhlbiBhZGQgaXRcbiAgICAgICAgaWYgKHJlc3VsdFtcIjFfMF9FeGVjSnNvblwiXSkge1xuICAgICAgICAgIC8vIEhhbmRsZSBhcyBleGVjXG4gICAgICAgICAgbGV0IGV4ZWN1dGlvbiA9IHJlc3VsdFtcIjFfMF9FeGVjSnNvblwiXTtcbiAgICAgICAgICByZXR1cm4gZXhlY3V0aW9uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IFNwbHVua0Vycm9yQ29kZS5TY2hlbWFWaW9sYXRpb247XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqIENyZWF0ZXMgYSBwcm9wZXIgYmFzZTY0IGVuY29kZWQgYXV0aCBzdHJpbmcsIHVzaW5nIHRoaXMgb2JqZWN0cyBjcmVkZW50aWFscy4gKi9cbiAgcHJpdmF0ZSBnZXQgYXV0aF9zdHJpbmcoKTogc3RyaW5nIHtcbiAgICBsZXQgYXV0aF9zdHJpbmcgPSBiYXNpY19hdXRoKHRoaXMudXNlcm5hbWUsIHRoaXMucGFzc3dvcmQpO1xuICAgIHJldHVybiBhdXRoX3N0cmluZztcbiAgfVxuXG4gIC8qKiBQZXJmb3JtcyB0aGUgZW50aXJlIHByb2Nlc3Mgb2Ygc2VhcmNoIHN0cmluZyAtPiByZXN1bHRzIGFycmF5XG4gICAqICBQZXJmb3JtcyBubyBjb25zb2xpZGF0aW9uLlxuICAgKiAgQXNzdW1lcyB5b3VyIHNlYXJjaCBzdHJpbmcgaXMgcHJvcGVybHkgY29uc3RyYWluZWQgdG8gdGhlIGhkZiBpbmRleFxuICAgKi9cbiAgYXN5bmMgaGRmX2V2ZW50X3NlYXJjaChzZWFyY2hfc3RyaW5nOiBzdHJpbmcpOiBQcm9taXNlPFVua25vd25QYXlsb2FkW10+IHtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVfc2VhcmNoKHNlYXJjaF9zdHJpbmcpXG4gICAgICAudGhlbihqb2JfaWQgPT4gdGhpcy5wZW5kX2pvYihqb2JfaWQsIDUwMCkpXG4gICAgICAudGhlbihqb2Jfc3RhdGUgPT4ge1xuICAgICAgICBpZiAoam9iX3N0YXRlLnN0YXR1cyA9PT0gXCJmYWlsZWRcIikge1xuICAgICAgICAgIHRocm93IFNwbHVua0Vycm9yQ29kZS5TZWFyY2hGYWlsZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRfc2VhcmNoX3Jlc3VsdHMoam9iX3N0YXRlLmpvYl9pZCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgdGhyb3cgcHJvY2Vzc19lcnJvcihlcnJvcik7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBqb2IgaWQgKi9cbiAgcHJpdmF0ZSBhc3luYyBjcmVhdGVfc2VhcmNoKHNlYXJjaF9zdHJpbmc6IHN0cmluZyk6IFByb21pc2U8Sm9iSUQ+IHtcbiAgICByZXR1cm4gZmV0Y2goYCR7dGhpcy5ob3N0fS9zZXJ2aWNlcy9zZWFyY2gvam9ic2AsIHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh7XG4gICAgICAgIEF1dGhvcml6YXRpb246IHRoaXMuYXV0aF9zdHJpbmdcbiAgICAgIH0pLFxuICAgICAgYm9keTogYHNlYXJjaD1zZWFyY2ggaW5kZXg9XCJoZGZcIiB8ICR7c2VhcmNoX3N0cmluZ31gXG4gICAgfSlcbiAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgcHJvY2Vzc19lcnJvcihyZXNwb25zZSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICB9KVxuICAgICAgLnRoZW4odGV4dCA9PiB7XG4gICAgICAgIC8vIFBhcnNlIHRoZSB4bWxcbiAgICAgICAgbGV0IHhtbCA9IHhtbDJqcyh0ZXh0LCB7XG4gICAgICAgICAgY29tcGFjdDogdHJ1ZVxuICAgICAgICB9KSBhcyBFbGVtZW50Q29tcGFjdDtcbiAgICAgICAgcmV0dXJuIHhtbC5yZXNwb25zZS5zaWQuX3RleHQgYXMgc3RyaW5nO1xuICAgICAgfSk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgam9iICovXG4gIHByaXZhdGUgYXN5bmMgY2hlY2tfam9iKGpvYl9pZDogSm9iSUQpOiBQcm9taXNlPEpvYlN0YXRlPiB7XG4gICAgcmV0dXJuIGZldGNoKGAke3RoaXMuaG9zdH0vc2VydmljZXMvc2VhcmNoL2pvYnMvJHtqb2JfaWR9YCwge1xuICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnMoe1xuICAgICAgICBBdXRob3JpemF0aW9uOiB0aGlzLmF1dGhfc3RyaW5nXG4gICAgICB9KVxuICAgIH0pXG4gICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IHByb2Nlc3NfZXJyb3IocmVzcG9uc2UpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKHRleHQgPT4ge1xuICAgICAgICAvLyBQYXJzZSB0aGUgeG1sXG4gICAgICAgIGxldCB4bWwgPSB4bWwyanModGV4dCwge1xuICAgICAgICAgIGNvbXBhY3Q6IHRydWVcbiAgICAgICAgfSkgYXMgRWxlbWVudENvbXBhY3Q7XG5cbiAgICAgICAgLy8gR2V0IHRoZSBrZXlzLCBhbmQgZmluZCB0aGUgb25lIHdpdGggbmFtZSBcImRpc3BhdGNoU3RhdGVcIlxuICAgICAgICBsZXQga2V5cyA9IHhtbC5lbnRyeS5jb250ZW50W1wiczpkaWN0XCJdW1wiczprZXlcIl07XG4gICAgICAgIGxldCBzdGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgICBmb3IgKGxldCBrIG9mIGtleXMpIHtcbiAgICAgICAgICBpZiAoay5fYXR0cmlidXRlcy5uYW1lID09PSBcImRpc3BhdGNoU3RhdGVcIikge1xuICAgICAgICAgICAgc3RhdGUgPSBrLl90ZXh0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIHdlIGZvdW5kIHN0YXRlXG4gICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAvLyBJdCBwcm9iYWJseSBmYWlsZWQgaWYgd2UgY2FuJ3QgZmluZCBpdCBsb2xcbiAgICAgICAgICBzdGF0ZSA9IFwiRkFJTEVEXCI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWNpZGUgcmVzdWx0IGJhc2VkIG9uIHN0YXRlXG4gICAgICAgIGxldCBzdGF0dXM6IEpvYlN0YXR1cztcbiAgICAgICAgaWYgKHN0YXRlID09IFwiRE9ORVwiKSB7XG4gICAgICAgICAgc3RhdHVzID0gXCJzdWNjZWVkZWRcIjtcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PSBcIkZBSUxFRFwiKSB7XG4gICAgICAgICAgc3RhdHVzID0gXCJmYWlsZWRcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGF0dXMgPSBcInBlbmRpbmdcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnN0cnVjdCB0aGUgc3RhdGVcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdGF0dXMsXG4gICAgICAgICAgam9iX2lkXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKiBDb250aW51YWxseSBjaGVja3MgdGhlIGpvYiB1bnRpbCByZXNvbHV0aW9uICovXG4gIHByaXZhdGUgYXN5bmMgcGVuZF9qb2Ioam9iX2lkOiBKb2JJRCwgaW50ZXJ2YWw6IG51bWJlcik6IFByb21pc2U8Sm9iU3RhdGU+IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSAqL1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgLyogZXNsaW50LWVuYWJsZSAqL1xuICAgICAgbGV0IHN0YXRlID0gYXdhaXQgdGhpcy5jaGVja19qb2Ioam9iX2lkKTtcbiAgICAgIGlmIChzdGF0ZS5zdGF0dXMgPT09IFwicGVuZGluZ1wiKSB7XG4gICAgICAgIGF3YWl0IGRlbGF5KGludGVydmFsKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldHMgdGhlIHNlYXJjaCByZXN1bHRzIGZvciBhIGdpdmVuIGpvYiBpZCwgaWYgaXQgaXMgZG9uZSAqL1xuICBwcml2YXRlIGFzeW5jIGdldF9zZWFyY2hfcmVzdWx0cyhqb2JfaWQ6IEpvYklEKTogUHJvbWlzZTxVbmtub3duUGF5bG9hZFtdPiB7XG4gICAgcmV0dXJuIGZldGNoKFxuICAgICAgYCR7dGhpcy5ob3N0fS9zZXJ2aWNlcy9zZWFyY2gvam9icy8ke2pvYl9pZH0vcmVzdWx0cy8/b3V0cHV0X21vZGU9anNvbiZjb3VudD0wYCxcbiAgICAgIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIEF1dGhvcml6YXRpb246IHRoaXMuYXV0aF9zdHJpbmdcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kOiBcIkdFVFwiXG4gICAgICB9XG4gICAgKVxuICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBwcm9jZXNzX2Vycm9yKHJlc3BvbnNlKTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIH0pXG4gICAgICAudGhlbihkYXRhID0+IHtcbiAgICAgICAgLy8gV2UgYmFzaWNhbGx5IGNhbid0LCBhbmQgcmVhbGx5IHNob3VsZG4ndCwgZG8gdHlwZXNjcmlwdCBoZXJlLiBPdXRwdXQgaXMgNTAlIGd1YXJhbnRlZWQgdG8gYmUgd29ua1xuICAgICAgICAvLyBHZXQgYWxsIHRoZSByYXdzXG4gICAgICAgIGxldCByYXdzOiBBcnJheTxzdHJpbmc+ID0gZGF0YVtcInJlc3VsdHNcIl0ubWFwKFxuICAgICAgICAgIChkYXR1bTogYW55KSA9PiBkYXR1bS5fcmF3XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gUGFyc2UgdG8ganNvbiwgYW5kIGZyZWV6ZVxuICAgICAgICBsZXQgcGFyc2VkID0gW10gYXMgVW5rbm93blBheWxvYWRbXTtcbiAgICAgICAgZm9yIChsZXQgdiBvZiByYXdzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBhcnNlZC5wdXNoKEpTT04ucGFyc2UodikgYXMgVW5rbm93blBheWxvYWQpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcnNlZDtcbiAgICAgIH0pO1xuICB9XG59XG5cbi8qKiBHaXZlbjogQSBsaXN0IG9mIGFsbCBwYXlsb2FkcyBmcm9tIGEgc2VhcmNoLFxuICogUHJvZHVjZTogQSBsaXN0IG9mIEV2YWx1YXRpb24gcGF5bG9hZHMgY29udGFpbmluZyBhbGwgZGF0YSBwcm9wZXJseSByZWNvbnN0cnVjdGVkLCByZWN1cnNpdmVseSwgaW50byBhIFwibm9ybWFsXCJcbiAqIEhERiBoZWlyYXJjaHkuXG4gKlxuICogVE9ETzogUHJvdmlkZSBhIG1lY2hhbmlzbSBmb3IgYWxzbyByZXR1cm5pbmcgb3JwaGFuZWQgaXRlbXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnNvbGlkYXRlX3BheWxvYWRzKFxuICBwYXlsb2FkczogVW5rbm93blBheWxvYWRbXVxuKTogRXhlY3V0aW9uUGF5bG9hZFtdIHtcbiAgLy8gR3JvdXAgYnkgZXhlYyBpZFxuICBsZXQgZ3JvdXBlZCA9IGdyb3VwX2J5KHBheWxvYWRzLCBwbCA9PiBwbC5tZXRhLmd1aWQpO1xuXG4gIGxldCBidWlsdCA9IG1hcF9oYXNoKGdyb3VwZWQsIGNvbnNvbGlkYXRlX2ZpbGVfcGF5bG9hZHMpO1xuXG4gIHJldHVybiBPYmplY3QudmFsdWVzKGJ1aWx0KTtcbn1cblxuLyoqIEdpdmVuOiBBIGxpc3Qgb2YgYWxsIHBheWxvYWRzIGZyb20gYSBzZWFyY2ggd2l0aCB0aGUgc2FtZSBHVUlEXG4gKiBQcm9kdWNlOiBBIHNpbmdsZSBFdmFsdWF0aW9uUGF5bG9hZCBjb250YWluaW5nIGFsbCBvZiB0aGVzZSBwYXlsb2FkcyByZWNvbnN0cnVjdGVkIGludG8gdGhlIGV4cGVjdGVkIEhERiBoZWlyYXJjaHlcbiAqL1xuZnVuY3Rpb24gY29uc29saWRhdGVfZmlsZV9wYXlsb2FkcyhcbiAgZmlsZV9wYXlsb2FkczogVW5rbm93blBheWxvYWRbXVxuKTogRXhlY3V0aW9uUGF5bG9hZCB7XG4gIC8vIEluIHRoZSBlbmQgd2Ugd2lzaCB0byBwcm9kdWNlIGEgc2luZ2xlIGV2YWx1YXRpb24gRXZlbnRQYXlsb2FkIHdoaWNoIGluIGZhY3QgY29udGFpbnMgYWxsIGRhdGEgZm9yIHRoZSBndWlkXG4gIC8vIEdyb3VwIGJ5IHN1YnR5cGVcbiAgbGV0IHN1YnR5cGVzID0gZ3JvdXBfYnkoZmlsZV9wYXlsb2FkcywgZXZlbnQgPT4gZXZlbnQubWV0YS5zdWJ0eXBlKTtcbiAgbGV0IGV4ZWNfZXZlbnRzID0gKHN1YnR5cGVzW1wiaGVhZGVyXCJdIHx8IFtdKSBhcyBFeGVjdXRpb25QYXlsb2FkW107XG4gIGxldCBwcm9maWxlX2V2ZW50cyA9IChzdWJ0eXBlc1tcInByb2ZpbGVcIl0gfHwgW10pIGFzIFByb2ZpbGVQYXlsb2FkW107XG4gIGxldCBjb250cm9sX2V2ZW50cyA9IChzdWJ0eXBlc1tcImNvbnRyb2xcIl0gfHwgW10pIGFzIENvbnRyb2xQYXlsb2FkW107XG5cbiAgLy8gVmVyaWZ5IHdlIG9ubHkgaGF2ZSBvbmUgZXhlYyBldmVudFxuICBpZiAoZXhlY19ldmVudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYEluY29ycmVjdCAjIG9mIEV2YWx1YXRpb24gZXZlbnRzLiBFeHBlY3RlZCAxLCBnb3QgJHtleGVjX2V2ZW50cy5sZW5ndGh9YFxuICAgICk7XG4gIH1cblxuICAvLyBQdWxsIGl0IG91dFxuICBsZXQgZXhlYyA9IGV4ZWNfZXZlbnRzWzBdO1xuXG4gIC8vIFB1dCBhbGwgdGhlIHByb2ZpbGVzIGludG8gdGhlIGV4ZWNcbiAgZXhlYy5wcm9maWxlcy5wdXNoKC4uLnByb2ZpbGVfZXZlbnRzKTtcblxuICAvLyBHcm91cCBjb250cm9scywgYW5kIHRoZW4gcHV0IHRoZW0gaW50byB0aGUgcHJvZmlsZXNcbiAgbGV0IHNoYV9ncm91cGVkX2NvbnRyb2xzID0gZ3JvdXBfYnkoXG4gICAgY29udHJvbF9ldmVudHMsXG4gICAgY3RybCA9PiBjdHJsLm1ldGEucHJvZmlsZV9zaGEyNTZcbiAgKTtcbiAgZm9yIChsZXQgcHJvZmlsZSBvZiBwcm9maWxlX2V2ZW50cykge1xuICAgIC8vIEdldCB0aGUgY29ycmVzcG9uZGluZyBjb250cm9scywgYW5kIHB1dCB0aGVtIGludG8gdGhlIHByb2ZpbGVcbiAgICBsZXQgc2hhID0gcHJvZmlsZS5tZXRhLnByb2ZpbGVfc2hhMjU2O1xuICAgIGxldCBjb3JyX2NvbnRyb2xzID0gc2hhX2dyb3VwZWRfY29udHJvbHNbc2hhXSB8fCBbXTtcbiAgICBwcm9maWxlLmNvbnRyb2xzLnB1c2goLi4uY29ycl9jb250cm9scyk7XG4gIH1cblxuICAvLyBTcGl0IGl0IGJhY2sgb3V0XG4gIHJldHVybiBleGVjO1xufVxuXG5leHBvcnQgZW51bSBTcGx1bmtFcnJvckNvZGUge1xuICBCYWROZXR3b3JrLCAvLyBTZXJ2ZXIgY291bGQgbm90IGJlIHJlYWNoZWQsIGVpdGhlciBkdWUgdG8gYmFkIGFkZHJlc3Mgb3IgYmFkIENPUlNcbiAgQmFkVXJsLCAvLyBVUkwgcG9vcmx5IGZvcm1lZFxuICBQYWdlTm90Rm91bmQsIC8vIFNlcnZlciBnYXZlIGVycm9yIDQwNFxuICBCYWRBdXRoLCAvLyBBdXRob3JpemF0aW9uIGNyZWRlbnRpYWxzIGFyZSBubyBnb29kXG4gIFNlYXJjaEZhaWxlZCwgLy8gRm9yIHdoYXRldmVyIHJlYXNvbiwgdGhlIHNwbHVuayBzZWFyY2ggZmFpbGVkXG4gIENvbnNvbGlkYXRpb25GYWlsZWQsIC8vIFNvbWV0aGluZyB3ZW50IHdyb25nIGR1cmluZyBldmVudCBjb25zb2xpZGF0aW9uIHBoYXNlXG4gIFNjaGVtYVZpb2xhdGlvbiwgLy8gVGhlIGRhdGEgd2UgZ290IG91dCBpc24ndCB2YWxpZCBIREYuIEhvcGUgdG8gbm90IHNlZSB0aGlzIHRvbyBvZnRlblxuICBJbnZhbGlkR1VJRCwgLy8gSWYgdGhlIHByb3ZpZGVkIEdVSUQgZGlkIG5vdCBtYXRjaCB0byBleGFjdGx5IG9uZSBoZWFkZXJcbiAgVW5rbm93bkVycm9yIC8vIE5vIGNsdWUhXG59XG5cbi8qKiBDb252ZXJ0cyBSZXNwb25zZXMgYW5kIEVycm9yY29kZXMgaW50byBwdXJlbHkganVzdCBlcnJvcmNvZGVzICovXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc19lcnJvcihcbiAgcjogUmVzcG9uc2UgfCBTcGx1bmtFcnJvckNvZGUgfCBUeXBlRXJyb3Jcbik6IFNwbHVua0Vycm9yQ29kZSB7XG4gIGNvbnNvbGUud2FybihcIkdvdCBlcnJvciBpbiBzcGx1bmsgb3BlcmF0aW9uc1wiKTtcbiAgY29uc29sZS53YXJuKHIpO1xuICBpZiAociBpbnN0YW5jZW9mIFR5cGVFcnJvcikge1xuICAgIGNvbnNvbGUud2FybihcIlR5cGVlcnJvclwiKTtcbiAgICBpZiAoci5tZXNzYWdlLmluY2x1ZGVzKFwiTmV0d29ya0Vycm9yXCIpKSB7XG4gICAgICByZXR1cm4gU3BsdW5rRXJyb3JDb2RlLkJhZE5ldHdvcms7XG4gICAgfSBlbHNlIGlmIChyLm1lc3NhZ2UuaW5jbHVkZXMoXCJub3QgYSB2YWxpZCBVUkxcIikpIHtcbiAgICAgIHJldHVybiBTcGx1bmtFcnJvckNvZGUuQmFkVXJsO1xuICAgIH1cbiAgfSBlbHNlIGlmIChyIGluc3RhbmNlb2YgUmVzcG9uc2UpIHtcbiAgICBjb25zb2xlLndhcm4oXCJCYWQgUmVzcG9uc2VcIik7XG4gICAgLy8gQmFzZWQgb24gdGhlIG5ldHdvcmsgY29kZSwgZ3Vlc3NcbiAgICBsZXQgcmVzcG9uc2UgPSByIGFzIFJlc3BvbnNlO1xuICAgIHN3aXRjaCAocmVzcG9uc2Uuc3RhdHVzKSB7XG4gICAgICBjYXNlIDQwMTogLy8gQmFkIHVzZXJuYW1lL3Bhc3N3b3JkXG4gICAgICAgIHJldHVybiBTcGx1bmtFcnJvckNvZGUuQmFkQXV0aDtcbiAgICAgIGNhc2UgNDA0OiAvLyBVUkwgZ290IGJvcmtlZFxuICAgICAgICByZXR1cm4gU3BsdW5rRXJyb3JDb2RlLlBhZ2VOb3RGb3VuZDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVW5zdXJlIGhvdyB0byBoYW5kbGUgZXJyb3IgXCIgKyByZXNwb25zZS5zdGF0dXMpO1xuICAgICAgICByZXR1cm4gU3BsdW5rRXJyb3JDb2RlLlVua25vd25FcnJvcjtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHIgPT09IHR5cGVvZiBTcGx1bmtFcnJvckNvZGUuVW5rbm93bkVycm9yKSB7XG4gICAgLy8gSXQncyBhbHJlYWR5IGFuIGVycm9yIGNvZGUgLSBwYXNzIGFsb25nXG4gICAgY29uc29sZS53YXJuKFwiU3BsdW5rRXJyb3JDb2RlXCIpO1xuICAgIHJldHVybiByO1xuICB9XG4gIC8vIGlkayBsb2xcbiAgcmV0dXJuIFNwbHVua0Vycm9yQ29kZS5Vbmtub3duRXJyb3I7XG59XG4iXSwidmVyc2lvbiI6M30=