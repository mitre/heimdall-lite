<template>
  <v-card>
    <v-card-subtitle>Easily load executions from splunk</v-card-subtitle>
    <v-carousel
      :hide-delimiters="true"
      :continuous="false"
      :show-arrows="false"
      v-model="carousel_step"
    >
      <v-carousel-item>
        <v-form v-model="valid">
          <v-text-field
            ref="splunk_userfield"
            v-model="username"
            label="Splunk username"
            :rules="required"
          />
          <v-text-field
            ref="splunk_password"
            v-model="password"
            label="Splunk password"
            :rules="required"
            :append-icon="show_secret ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show_secret ? 'text' : 'password'"
            @click:append="show_secret = !show_secret"
          />
          <v-text-field
            ref="splunk_hostname"
            v-model="splunk_hostname"
            label="Splunk endpoint url"
            :rules="required"
            hint="Ex: https://localhost:8089"
          />
          <v-btn @click="try_continue" :disabled="!valid"> Continue </v-btn>
        </v-form>
      </v-carousel-item>
      <v-carousel-item>
        <div>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
          <v-data-table
            :headers="headers"
            item-key="guid"
            :items="items"
            :search="search"
          >
          </v-data-table>
        </div>
      </v-carousel-item>
    </v-carousel>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import {
  ExecutionMetaInfo,
  SplunkEndpoint
} from "../../../utilities/splunk_util";
import InspecIntakeModule, {
  FileID,
  next_free_file_ID
} from "@/store/report_intake";

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
  components: {}
})
export default class SplunkReader extends Props {
  /** where we're looking */
  carousel_step: number = 0; // 0 -> auth, 1 -> data

  /** Whether to show password */
  show_secret: boolean = false;

  /** The current error that we are showing */
  shown_error: string | null = "hewwo";

  /** Form required field rules. Maybe eventually expand to other stuff */
  required = [(v: string) => !!v || "Field is required"];

  /** Auth info */
  valid: boolean = false;
  username: string = "a";
  password: string = "b";
  splunk_hostname: string =
    "https://codingexplained.com/coding/front-end/vue-js/accessing-dom-refs";

  /** Table info */
  headers = [
    {
      text: "Filename",
      value: "filename",
      filterable: true,
      align: "start"
    },
    {
      text: "Something else",
      value: "subtype"
    }
  ];
  search: string = "";
  items: ExecutionMetaInfo[] = [];

  /** Attempts to authorize and show files with currently provided/loaded credentials.
   * This is the callback used by all "login" buttons.
   */
  async refresh() {
    this.shown_error = null;
  }

  /** Callback for when user goes to next step */
  try_continue() {
    // Check splunk
    let s = new SplunkEndpoint(
      this.splunk_hostname,
      this.username,
      this.password
    );

    s.hdf_event_search("*")
      .then(ok => {
        // all goes well, proceed
        this.carousel_step = 1;
      })
      .catch(err => {
        console.error("Oh no!");
        console.error(err);
      });
  }

  /** Callback for when user selects a file */
  async load_file(index: number): Promise<void> {
    /** 
        success => {
          let content: string = new TextDecoder("utf-8").decode(
            success.Body! as Uint8Array
          );
          intake_module
            .loadText({
              text: content,
              filename: file.Key!,
              unique_id
            })
            .then(() => this.$emit("got-files", [unique_id]));
        },
        (failure: any) => this.handle_error(failure)
      );*/
  }

  /** Callback to handle an error */
  handle_error(error: any): void {
    this.shown_error = "error";
  }
}
</script>

<style scoped>
.test_class {
  position: static;
}
</style>
