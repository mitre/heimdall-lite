<template>
  <v-tabs>
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
      <FileReader class="pa-4" @got-files="got_files" />
    </v-tab-item>

    <v-tab-item value="uploadtab-s3">
      <S3Reader class="pa-4" @got-files="got_files" />
    </v-tab-item>

    <v-tab-item value="uploadtab-splunk">
      Coming soon
    </v-tab-item>
  </v-tabs>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import InspecIntakeModule, { FileID } from "@/store/report_intake";
import FileReader from "@/components/global/upload_tabs/FileReader.vue";
import S3Reader from "@/components/global/upload_tabs/S3Reader.vue";

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {}
});

/**
 * Multiplexes all of our file upload components
 * Emits "got-files" with a list of the unique_ids of the loaded files, wherever they come from
 */
@Component({
  components: {
    FileReader,
    S3Reader
  }
})
export default class UploadNexus extends Props {
  // Event passthrough
  got_files(files: FileID[]) {
    this.$emit("got-files", files);
  }
}
</script>
