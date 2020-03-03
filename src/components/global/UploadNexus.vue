<template>
  <Modal
    :value="value"
    @input="$emit('input', $event.target.value)"
    :persistent="persistent"
  >
    <v-progress-linear indeterminate v-if="loading"></v-progress-linear>
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

      <v-tab href="#uploadtab-s3">S3 Bucket</v-tab>

      <v-tab href="#uploadtab-azure">Azure Blob</v-tab>

      <v-tab href="#uploadtab-splunk">Splunk</v-tab>
      <v-spacer />
      <v-divider />
      <v-tab href="#uploadtab-samples">Samples</v-tab>

      <!-- Include those components -->
      <v-tab-item value="uploadtab-local">
        <FileReader @got-files="got_files" />
      </v-tab-item>

      <v-tab-item value="uploadtab-samples">
        <SampleList @got-files="got_files" />
      </v-tab-item>

      <v-tab-item value="uploadtab-s3">
        <S3Reader class="pa-4" @got-files="got_files" />
      </v-tab-item>

      <v-tab-item value="uploadtab-azure">
        <AzureReader
          class="pa-4"
          @got-files="got_files"
          @start-loading="start_loading"
          @stop-loading="stop_loading"
        />
      </v-tab-item>

      <v-tab-item value="uploadtab-splunk">
        <v-container>
          <v-row class="title pa-2">
            <p>Coming Soon</p>
          </v-row>
          <v-row class="pa-2 text-justify">
            <p>
              Soon Heimdall will be able to consume Heimdall Results Format data
              from a Splunk data source making it easy to access your enterprise
              security data right from the browsers, any-time and any-where.
            </p>
          </v-row>
        </v-container>
      </v-tab-item>
    </v-tabs>
    <HelpFooter />
  </Modal>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import InspecIntakeModule, { FileID } from "@/store/report_intake";
import Modal from "@/components/global/Modal.vue";
import FileReader from "@/components/global/upload_tabs/FileReader.vue";
import HelpFooter from "@/components/global/upload_tabs/HelpFooter.vue";
import S3Reader from "@/components/global/upload_tabs/aws/S3Reader.vue";
import AzureReader from "@/components/global/upload_tabs/azure/AzureReader.vue";
import SampleList from "@/components/global/upload_tabs/SampleList.vue";
import { LocalStorageVal } from "../../utilities/helper_util";

const local_tab = new LocalStorageVal<string>("nexus_curr_tab");

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
    HelpFooter,
    S3Reader,
    AzureReader,
    SampleList
  }
})
export default class UploadNexus extends Props {
  active_tab: string = ""; // Set in mounted

  loading: boolean = false; // determine if you should render loading screen

  // Loads the last open tab
  mounted() {
    this.active_tab = local_tab.get_default("uploadtab-local");
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

  // Handle loading
  start_loading() {
    console.log("start loading");
    this.loading = true;
  }

  // Handle stop loading
  stop_loading() {
    console.log("stop loading");
    this.loading = false;
  }
}
</script>
