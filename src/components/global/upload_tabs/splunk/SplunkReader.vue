<template>
  <ErrorTooltip ref="error_tooltip">
    <v-stepper v-model="step" vertical>
      <v-stepper-step step="1">
        Login Credentials
      </v-stepper-step>
      <v-stepper-step step="2">
        Search Execution Events
      </v-stepper-step>

      <AuthStep @authenticated="handle_login" @error="handle_error" />

      <!-- :complete="!!assumed_role && assumed_role.from_mfa" -->

      <FileList
        :endpoint="splunk_state"
        @exit-list="handle_logout"
        @got-files="got_files"
        @error="handle_error"
      />
    </v-stepper>
  </ErrorTooltip>
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
import ErrorTooltip from "../../../generic/ErrorTooltip.vue";

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {}
});

/**
 * File reader component for taking in inspec JSON data.
 * Uploads data to the store with unique IDs asynchronously as soon as data is entered.
 * Emits "got-files" with a list of the unique_ids of the loaded files.
 */
@Component({
  components: {
    AuthStep,
    FileList,
    ErrorTooltip
  }
})
export default class SplunkReader extends Props {
  /** Our session information, saved iff valid */
  splunk_state: SplunkEndpoint | null = null;

  /** Current step. 1 for login, 2 for search */
  step: number = 1;

  /** When login is clicked - save credentials, verify that they work, then proceed if they do*/
  handle_login(new_endpoint: SplunkEndpoint) {
    // Store the state
    this.splunk_state = new_endpoint;

    // Move the carousel
    this.step = 2;
  }

  /** When cancel/logoutis clicked from the search window */
  handle_logout() {
    this.step = 1;
    this.splunk_state = null;
  }

  /** Callback to handle a splunk error.
   * Sets shown error.
   */
  handle_error(error: SplunkErrorCode): void {
    console.log(error);
    switch (error) {
      case SplunkErrorCode.BadNetwork:
        this.show_error_message(
          "Connection to host failed. Please ensure that the hostname is correct, and that your splunk server has been properly configured to allow CORS requests"
        );
        break;
      case SplunkErrorCode.PageNotFound:
        this.show_error_message(
          "Connection made with errors. Please ensure your hostname is formatted as shown in the example."
        );
        break;
      case SplunkErrorCode.BadAuth:
        this.show_error_message("Bad username or password.");
        break;
      case SplunkErrorCode.SearchFailed:
        this.show_error_message("Internal splunk error while searching");
        break;
      case SplunkErrorCode.ConsolidationFailed:
      case SplunkErrorCode.SchemaViolation:
        this.show_error_message("Error creating execution from splunk events.");
        break;
      case SplunkErrorCode.InvalidGUID:
        this.show_error_message(
          "Duplicate execution GUID detected. The odds of this happening should be astronomically low. Please file a bug report."
        );
        break;
      case SplunkErrorCode.UnknownError:
        this.show_error_message(
          "Something went wrong, but we're not sure what. Please file a bug report."
        );
        break;
    }
  }

  /** Give our error tooltip the message */
  show_error_message(msg: string) {
    let tt = this.$refs["error_tooltip"] as ErrorTooltip;
    tt.show_error(msg);
  }

  /** Callback on got files */
  got_files(files: Array<FileID>) {
    this.$emit("got-files", files);
  }
}
</script>
