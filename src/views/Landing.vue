<template>
  <BaseView>
    <!-- Same Search bar as is in results view, idea being that this one is non functional -->
    <template #topbar-content>
      <v-text-field
        flat
        solo-inverted
        hide-details
        prepend-inner-icon="mdi-magnify"
        label="Search"
        v-model="search_term"
      ></v-text-field>
      <v-spacer />
      <v-btn title="Clear all set filters">
        Clear
      </v-btn>
    </template>

    <!-- The main content: cards, etc -->
    <template #main-content> </template>

    <!-- File select modal toggle -->

    <v-btn
      bottom
      color="teal"
      dark
      fab
      fixed
      right
      @click="dialog = !dialog"
      :hidden="dialog"
    >
      <v-icon large>mdi-plus-circle</v-icon>
    </v-btn>

    <!-- File select modal -->
    <Modal v-model="dialog">
      <v-container fluid align="center" class="grey darken-3">
        <v-tabs vertical>
          <v-tabs-slider></v-tabs-slider>
          <!-- Define our tabs -->
          <v-tab href="#uploadtab-local">
            Local Files
          </v-tab>

          <v-tab href="#uploadtab-s3">
            S3 Bucket
          </v-tab>

          <v-tab href="#uploadtab-splunk">
            Splunk
          </v-tab>

          <!-- Include those components -->
          <v-tab-item value="uploadtab-local">
            <v-col cols="12" align="center">
              <v-row justify="center">
                <img :src="require('@/assets/logo.png')" />
              </v-row>
              <v-row justify="center">
                <div class="display-4">Heimdall-Lite</div>
              </v-row>
              <v-spacer></v-spacer>
              <v-row justify="center">
                <v-col cols="6" justify="center" align="center">
                  <FileReader @got-files="on_got_files" />
                </v-col>
              </v-row>
            </v-col>
          </v-tab-item>

          <v-tab-item value="uploadtab-s3">
            <v-col cols="12" align="center">
              <v-row justify="center">
                <img :src="require('@/assets/logo.png')" />
              </v-row>
              <v-row justify="center">
                <div class="display-4">Heimdall-Lite</div>
              </v-row>
              <v-spacer></v-spacer>
              <v-row justify="center">
                <v-col cols="6" justify="center" align="center">
                  Coming Soon
                </v-col>
              </v-row>
            </v-col>
          </v-tab-item>

          <v-tab-item value="uploadtab-splunk">
            <v-col cols="12" align="center">
              <v-row justify="center">
                <img :src="require('@/assets/logo.png')" />
              </v-row>
              <v-row justify="center">
                <div class="display-4">Heimdall-Lite</div>
              </v-row>
              <v-spacer></v-spacer>
              <v-row justify="center">
                <v-col cols="6" justify="center" align="center">
                  Coming soon
                </v-col>
              </v-row>
            </v-col>
          </v-tab-item>
        </v-tabs>
      </v-container>
    </Modal>
  </BaseView>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import BaseView from "@/views/BaseView.vue";
import Modal from "@/components/global/Modal.vue";
import FileReader from "@/components/global/FileReader.vue";

import { Filter, NistMapState } from "@/store/data_filters";
import { FileID } from "@/store/report_intake";

// We declare the props separately
// to make props types inferrable.
const LandingProps = Vue.extend({
  props: {}
});

@Component({
  components: {
    BaseView,
    Modal,
    FileReader
  }
})
export default class Landing extends LandingProps {
  /** Whether or not the model is showing */
  dialog: boolean = true;

  /**
   * Invoked when file(s) are loaded.
   */
  on_got_files(ids: FileID[]) {
    // Close the dialog
    this.dialog = false;

    // If just one file, focus it
    if (ids.length === 1) {
      this.$router.push(`/results/${ids[0]}`);
    }

    // If more than one, focus all.
    // TODO: Provide support for focusing a subset of files
    else if (ids.length > 1) {
      this.$router.push(`/results/all`);
    }
  }
}
</script>
