<template>
  <v-container>
    <Modal
      :value="value"
      @input="$emit('input', $event.target.value)"
      :persistent="persistent"
    >
      <v-tabs
        :vertical="$vuetify.breakpoint.mdAndUp"
        active
        :value="active_tab"
        @change="selected_tab"
        color="primary-visible"
        show-arrows
      >
        <v-tabs-slider></v-tabs-slider>
        <!-- Define our tabs -->
        <v-tab href="#uploadtab-local">Local Files</v-tab>

        <v-tab v-if="is_logged_in" href="#uploadtab-database">
          {{ user }} Files
        </v-tab>

        <v-tab href="#uploadtab-s3">S3 Bucket</v-tab>

        <v-tab href="#uploadtab-splunk">Splunk</v-tab>
        <v-spacer />
        <v-divider />
        <v-tab href="#uploadtab-samples">Samples</v-tab>

        <!-- Include those components -->
        <v-tab-item value="uploadtab-local">
          <FileReader @got-files="got_files" />
        </v-tab-item>

        <v-tab-item value="uploadtab-database">
          <DatabaseReader @got-files="got_files" />
        </v-tab-item>

        <v-tab-item value="uploadtab-samples">
          <SampleList @got-files="got_files" />
        </v-tab-item>

        <v-tab-item value="uploadtab-s3">
          <S3Reader class="pa-4" @got-files="got_files" />
        </v-tab-item>

        <v-tab-item value="uploadtab-splunk">
          <v-container>
            <v-row class="title pa-2">
              <p>Coming Soon</p>
            </v-row>
            <v-row class="pa-2 text-justify">
              <p>
                Soon Heimdall will be able to consume Heimdall Results Format
                data from a Splunk data source making it easy to access your
                enterprise security data right from the browsers, any-time and
                any-where.
              </p>
            </v-row>
          </v-container>
        </v-tab-item>
      </v-tabs>
      <HelpFooter />
    </Modal>
  </v-container>
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
import S3Reader from "@/components/global/upload_tabs/aws/S3Reader.vue";
import SampleList from "@/components/global/upload_tabs/SampleList.vue";
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
const local_user = new LocalStorageVal<UserProfile | null>("user_profile");

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {
    value: Boolean, // Whether it is open. Modelable
    persistent: Boolean // Whether clicking outside closes
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
    SampleList
  }
})
export default class UploadNexus extends Props {
  active_tab: string = ""; // Set in mounted
  //user_profile: UserProfile = null;

  // Loads the last open tab
  mounted() {
    console.log("mount UploadNexus");
    this.active_tab = local_tab.get_default("uploadtab-local");
    this.profile();
    //let user_profile = mod.profile();
    //console.log("got user_profile" + user_profile.id);
  }

  async profile(): Promise<void> {
    let mod = getModule(ServerModule, this.$store);
    await mod
      .connect("http://localhost:8050")
      .catch(bad => {
        console.error("Unable to connect");
        this.$router.go(0);
      })
      .then(() => {
        return mod.profile();
      })
      .catch(bad => {
        console.error(`bad profile ${bad}`);
      })
      .then(() => {
        if (mod.user_profile) {
          console.log("Good profile!");
          console.log(mod.user_profile.id);
        } else {
          console.log("No profile!");
        }
      });
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
    return "User";
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
}
</script>
