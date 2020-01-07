<template>
  <v-stepper v-model="step" vertical>
    <v-stepper-step step="1">
      Login Credentials
    </v-stepper-step>

    <AuthStep
      v-bind:username.sync="username"
      v-bind:password.sync="password"
      v-bind:hostname.sync="hostname"
      @auth="handle_login"
      @error="handle_error"
    />

    <!-- :complete="!!assumed_role && assumed_role.from_mfa" -->
    <v-stepper-step step="2">
      Search Execution Events
    </v-stepper-step>

    <FileList
      :endpoint="splunk_state"
      @exit-list="handle_loguout"
      @got-files="got_files"
      @error="handle_error"
    />
  </v-stepper>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import InspecIntakeModule, { FileID } from "@/store/report_intake";
import AuthStep from "./AuthStep.vue";
import FileList from "./FileList.vue";
import {
  SplunkEndpoint,
  SplunkErrorCode
} from "../../../../utilities/splunk_util";
import { LocalStorageVal } from "../../../../utilities/helper_util";

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {}
});

const local_username = new LocalStorageVal<string>("splunk_username");
const local_password = new LocalStorageVal<string>("splunk_password");
const local_hostname = new LocalStorageVal<string>("splunk_hostname");

/**
 * File reader component for taking in inspec JSON data.
 * Uploads data to the store with unique IDs asynchronously as soon as data is entered.
 * Emits "got-files" with a list of the unique_ids of the loaded files.
 */
@Component({
  components: {
    AuthStep,
    FileList
  }
})
export default class S3Reader extends Props {
  /** What error is currently shown, if any. Shared between stages. */
  error: string | null = null;

  /** State of all globally relevant fields */
  username: string = "";
  password: string = "";
  hostname: string = "";

  /** Our session information, saved iff valid */
  splunk_state: SplunkEndpoint | null = null;

  /** Current step. 1 for login, 2 for search */
  step: number = 1;

  /** When login is clicked - save credentials, verify that they work, then proceed if they do*/
  handle_login() {
    // If we need another error, it will be set shortly. If not, the old one is probably not relevant
    this.error = null;

    // Save credentials
    local_username.set(this.username);
    local_password.set(this.password);
    local_hostname.set(this.hostname);

    // Check splunk
    let s = new SplunkEndpoint(this.hostname, this.username, this.password);

    s.hdf_event_search("search *")
      .then(ok => {
        // all goes well, proceed
        this.step = 2;
        this.splunk_state = s;
      })
      .catch(err => {
        console.error("Oh no! Splunk search failed with following error");
        console.error(err);
      });
  }

  /** When cancel/logoutis clicked from the search window */
  handle_loguout() {
    this.step = 1;
    this.splunk_state = null;
  }

  /** On mount, try to look up stored auth info */
  mounted() {
    // Load our saved garbage
    this.username = local_username.get_default("");
    this.password = local_password.get_default("");
    this.hostname = local_hostname.get_default("");
  }

  /** Callback to handle a splunk error.
   * Sets shown error.
   */
  handle_error(error: SplunkErrorCode): void {
    switch (error) {
      case SplunkErrorCode.BadNetwork:
        break;
      case SplunkErrorCode.PageNotFound:
        break;
      case SplunkErrorCode.BadAuth:
        break;
      case SplunkErrorCode.SearchFailed:
        break;
      case SplunkErrorCode.ConsolidationFailed:
        break;
      case SplunkErrorCode.SchemaViolation:
        break;
      case SplunkErrorCode.InvalidGUID:
        break;
      case SplunkErrorCode.UnknownError:
        break;
    }
  }

  /** Callback on got files */
  got_files(files: Array<FileID>) {
    this.$emit("got-files", files);
  }
}
</script>
