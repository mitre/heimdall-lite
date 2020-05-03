<template>
  <div>
    <div v-if="modal">
      <Modal
        :value="value"
        @input="$emit('input', $event.target.value)"
        :persistent="persistent"
      >
        <v-stepper v-model="e6" class="elevation-0">
          <v-stepper-step :complete="e6 > 1" step="1">
            Choose a data source
            <small>Summarize if needed</small>
          </v-stepper-step>
          <v-stepper-content step="1" style="padding-left: 100px">
            <v-radio-group v-model="picked" column>
              <v-radio label="Heimdall Database" value="backend"></v-radio>
              <v-radio label="S3 Bucket" value="s3"></v-radio>
              <v-radio label="Splunk" value="splunk"></v-radio>
              <v-radio label="Upload Profile" value="local_files"></v-radio>
              <v-radio label="Sample Profiles" value="sample"></v-radio>
            </v-radio-group>
            <v-btn
              v-if="picked != 'local_files'"
              @click="e6 = 2"
              :disabled="!picked"
              color="primary"
              >Continue</v-btn
            >
            <FileReader v-if="picked == 'local_files'" @got-files="got_files" />
            <div hidden>
              <input
                ref="real-input"
                type="file"
                multiple
                @change="select_file"
                accept=".json, application/json"
              />
            </div>
          </v-stepper-content>

          <v-stepper-step
            :complete="e6 > 2"
            v-if="(picked == 'backend') | 's3'"
            step="2"
            >Connect to Heimdall Database</v-stepper-step
          >

          <v-stepper-step :complete="e6 > 2" v-if="picked == 's3'" step="2"
            >Connect to S3</v-stepper-step
          >
          <v-stepper-step :complete="e6 > 2" v-if="picked == 'splunk'" step="2"
            >Connect to Splunk</v-stepper-step
          >
          <v-stepper-step :complete="e6 > 2" v-if="picked == 'sample'" step="2"
            >Choose sample profile</v-stepper-step
          >

          <v-stepper-content v-if="picked == 'backend'" step="2">
            <v-content
              v-if="!is_logged_in"
              style="padding-left: 100px; padding-right:100px"
            >
              <v-btn
                @click="signup()"
                v-if="auth_choice == 'login'"
                depressed
                color="blue-grey"
                >Sign Up</v-btn
              >
              <v-btn
                @click="login()"
                v-if="auth_choice == 'signup'"
                depressed
                color="blue-grey"
                >Login</v-btn
              >
              <Login v-if="auth_choice == 'login'" />
              <Signup v-if="auth_choice == 'signup'" />
              <v-btn @click="e6 = 1" style="float: right;" text>Go Back</v-btn>
            </v-content>
            <v-content v-if="is_logged_in">
              Logged in as {{ user }}
              <v-btn @click="logout()" style="float: right;">Logout</v-btn>
              <v-btn @click="e6 = 1" style="float: right;" text>Go Back</v-btn>
            </v-content>
          </v-stepper-content>

          <v-stepper-content
            v-if="picked == 's3'"
            step="2"
            style="padding-left: 100px; padding-right:100px"
          >
            <S3Reader @got-files="got_files" />
            <v-btn @click="e6 = 1" text style="float: right;">Go Back</v-btn>
          </v-stepper-content>

          <v-stepper-content
            v-if="picked == 'splunk'"
            step="2"
            style="padding-left: 100px; padding-right:100px"
          >
            <SplunkReader @got-files="got_files" />
            <v-btn @click="e6 = 1" style="float: right;" text>Go Back</v-btn>
          </v-stepper-content>

          <v-stepper-content
            v-if="picked == 'local_files'"
            step="2"
            style="padding-left: 100px; padding-right:100px"
          >
            <FileReader @got-files="got_files" />
            <v-btn @click="e6 = 1" style="float: right;" text>Go Back</v-btn>
          </v-stepper-content>
          <v-stepper-content
            v-if="picked == 'sample'"
            step="2"
            style="padding-left: 100px; padding-right:100px"
          >
            <SampleList @got-files="got_files" />
            <v-btn @click="e6 = 1" style="float: right;" text>Go Back</v-btn>
          </v-stepper-content>
        </v-stepper>
      </Modal>
    </div>
    <div v-else>
      <v-card>
        <v-card-text>
          <Header />
          <v-stepper v-model="e6" class="elevation-0">
            <v-stepper-step :complete="e6 > 1" step="1">
              Choose a data source
              <small>Summarize if needed</small>
            </v-stepper-step>
            <v-stepper-content step="1" style="padding-left: 100px">
              <v-radio-group v-model="picked" column>
                <v-radio label="Heimdall Database" value="backend"></v-radio>
                <v-radio label="S3 Bucket" value="s3"></v-radio>
                <v-radio label="Splunk" value="splunk"></v-radio>
                <v-radio label="Upload Profile" value="local_files"></v-radio>
                <v-radio label="Sample Profiles" value="sample"></v-radio>
              </v-radio-group>
              <v-btn
                v-if="picked != 'local_files'"
                @click="e6 = 2"
                :disabled="!picked"
                color="primary"
                >Continue</v-btn
              >
              <FileReader
                v-if="picked == 'local_files'"
                @got-files="got_files"
              />
              <div hidden>
                <input
                  ref="real-input"
                  type="file"
                  multiple
                  @change="select_file"
                  accept=".json, application/json"
                />
              </div>
            </v-stepper-content>

            <v-stepper-step
              :complete="e6 > 2"
              v-if="(picked == 'backend') | 's3'"
              step="2"
              >Connect to Heimdall Database</v-stepper-step
            >

            <v-stepper-step :complete="e6 > 2" v-if="picked == 's3'" step="2"
              >Connect to S3</v-stepper-step
            >
            <v-stepper-step
              :complete="e6 > 2"
              v-if="picked == 'splunk'"
              step="2"
              >Connect to Splunk</v-stepper-step
            >
            <v-stepper-step
              :complete="e6 > 2"
              v-if="picked == 'sample'"
              step="2"
              >Choose sample profile</v-stepper-step
            >

            <v-stepper-content v-if="picked == 'backend'" step="2">
              <v-content
                v-if="!is_logged_in"
                style="padding-left: 100px; padding-right:100px"
              >
                <v-btn
                  @click="signup()"
                  v-if="auth_choice == 'login'"
                  depressed
                  color="blue-grey"
                  >Sign Up</v-btn
                >
                <v-btn
                  @click="login()"
                  v-if="auth_choice == 'signup'"
                  depressed
                  color="blue-grey"
                  >Login</v-btn
                >
                <Login v-if="auth_choice == 'login'" />
                <Signup v-if="auth_choice == 'signup'" />
                <v-btn @click="e6 = 1" style="float: right;" text
                  >Go Back</v-btn
                >
              </v-content>
              <v-content v-if="is_logged_in">
                Logged in as {{ user }}
                <v-btn @click="logout()" style="float: right;">Logout</v-btn>
                <v-btn @click="e6 = 1" style="float: right;" text
                  >Go Back</v-btn
                >
              </v-content>
            </v-stepper-content>

            <v-stepper-content
              v-if="picked == 's3'"
              step="2"
              style="padding-left: 100px; padding-right:100px"
            >
              <S3Reader @got-files="got_files" />
              <v-btn @click="e6 = 1" text style="float: right;">Go Back</v-btn>
            </v-stepper-content>

            <v-stepper-content
              v-if="picked == 'splunk'"
              step="2"
              style="padding-left: 100px; padding-right:100px"
            >
              <SplunkReader @got-files="got_files" />
              <v-btn @click="e6 = 1" style="float: right;" text>Go Back</v-btn>
            </v-stepper-content>

            <v-stepper-content
              v-if="picked == 'local_files'"
              step="2"
              style="padding-left: 100px; padding-right:100px"
            >
              <FileReader @got-files="got_files" />
              <v-btn @click="e6 = 1" style="float: right;" text>Go Back</v-btn>
            </v-stepper-content>
            <v-stepper-content
              v-if="picked == 'sample'"
              step="2"
              style="padding-left: 100px; padding-right:100px"
            >
              <SampleList @got-files="got_files" />
              <v-btn @click="e6 = 1" style="float: right;" text>Go Back</v-btn>
            </v-stepper-content>
          </v-stepper>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import InspecIntakeModule, { FileID } from "@/store/report_intake";
import Modal from "@/components/global/Modal.vue";
import FileReader from "@/components/global/upload_tabs/FileReader.vue";
import DatabaseReader from "@/components/global/upload_tabs/DatabaseReader.vue";
import HelpFooter from "@/components/global/upload_tabs/HelpFooter.vue";
import Header from "@/components/global/upload_tabs/Header.vue";
import S3Reader from "@/components/global/upload_tabs/aws/S3Reader.vue";
import SplunkReader from "@/components/global/upload_tabs/splunk/SplunkReader.vue";
import SampleList from "@/components/global/upload_tabs/SampleList.vue";
import Login from "@/components/global/data_source/Login.vue";
import Signup from "@/components/global/data_source/Signup.vue";
import ServerModule from "@/store/server";
import { LocalStorageVal } from "@/utilities/helper_util";

export class UserProfile {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  image?: string;
  phone_number?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const local_tab = new LocalStorageVal<string>("nexus_curr_tab");

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {
    value: Boolean, // Whether it is open. Modelable
    persistent: Boolean, // Whether clicking outside closes
    modal: Boolean
  }
});

/**
 * Multiplexes all of our file upload components
 * Emits "got-files" with a list of the unique_ids of the loaded files, wherever they come from
 */
@Component({
  components: {
    Modal,
    FileReader,
    DatabaseReader,
    HelpFooter,
    S3Reader,
    SplunkReader,
    SampleList,
    Login,
    Signup,
    Header
  }
})
export default class UploadNexusNew extends Props {
  active_tab: string = ""; // Set in mounted
  e6: number = 1;
  picked: string = "";
  auth_choice: string = "login";
  // Loads the last open tab
  mounted() {
    console.log("mount UploadNexus");
    console.log(this.modal);
    this.active_tab = local_tab.get_default("uploadtab-local");
  }

  get is_logged_in(): boolean {
    if (this.token) {
      return true;
    } else {
      return false;
    }
  }

  get token(): string {
    let mod = getModule(ServerModule, this.$store);
    return mod.token || "";
  }

  get user(): string {
    let mod = getModule(ServerModule, this.$store);
    if (mod.profile) {
      return mod.profile.email || "pending";
    } else {
      return "pending";
    }
  }

  login() {
    this.auth_choice = "login";
  }
  signup() {
    this.auth_choice = "signup";
  }
  logout() {
    getModule(ServerModule, this.$store).clear_token();
    // this.dialog = false;
    this.$router.push("/");
  }

  // Handles change in tab
  selected_tab(new_tab: string) {
    this.active_tab = new_tab;
    local_tab.set(new_tab);
  }

  // Event passthrough
  got_files(files: FileID[]) {
    this.$emit("got-files", files);
  }

  select_file() {
    let raw_files = (this.$refs["real-input"] as any).files as
      | FileList
      | undefined
      | null;
    // Coerce into a more ergonomic type
    let files = fix_files(raw_files);
    if (files.length > 0) {
      // Notify we got files
      this.$emit("files-selected", files);
    }
  }
  /** Programatically show real input selector */
  show_selector() {
    let file_input = this.$refs["real-input"];
    (file_input as any).click();
  }
}

function fix_files(f: FileList | null | undefined): File[] {
  if (f === null || f === undefined) {
    return [];
  } else {
    return [...f];
  }
}
</script>
