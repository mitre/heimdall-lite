<template>
  <div class="caption font-weight-medium">
    <VueFileAgent
      ref="vueFileAgent"
      :theme="'list'"
      :multiple="true"
      :deletable="true"
      :meta="true"
      :accept="'.json, application/json'"
      :helpText="'Click to choose file(s) or drag and drop file(s)'"
      :errorText="errorText"
      @select="filesSelected($event)"
      @beforedelete="onBeforeDelete($event)"
      @delete="fileDeleted($event)"
      v-model="fileRecords"
    ></VueFileAgent>
    <br />
    <v-btn :disabled="disableUpload" @click="uploadFiles()">
      Upload file(s)
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import vueFileAgent from 'vue-file-agent';
import 'vue-file-agent/dist/vue-file-agent.css';

Vue.use(vueFileAgent);

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
export default class UploadButton extends Props {
  fileRecords = [];
  fileRecordsForUpload = [];

  errorText = {
    type: 'Invalid file type. Only json allowed.'
  };

  disableUpload = true;

  isUploadable() {
    if (!this.fileRecordsForUpload.length) {
      this.disableUpload = true;
    } else if (this.fileRecords.length == this.fileRecordsForUpload.length) {
      this.disableUpload = false;
    } else {
      this.disableUpload = true;
    }
  }

  uploadFiles() {
    var fileToUpload = [];

    for (var i = 0; i < this.fileRecordsForUpload.length; i++) {
      fileToUpload.push(this.fileRecordsForUpload[i].file);
    }
    // Notify we got files
    this.$emit('files-selected', fileToUpload);
  }

  filesSelected(fileRecordsNewlySelected: any) {
    var validFileRecords = fileRecordsNewlySelected.filter(
      (fileRecord: any) => !fileRecord.error
    );
    this.fileRecordsForUpload = this.fileRecordsForUpload.concat(
      validFileRecords
    );
    this.$nextTick(() => {
      this.isUploadable();
    });
  }

  onBeforeDelete(fileRecord: any) {
    var i = this.fileRecordsForUpload.indexOf(fileRecord);
    if (confirm('Are you sure you want to delete?')) {
      this.$refs.vueFileAgent.deleteFileRecord(fileRecord); // will trigger 'delete' event
      this.$nextTick(() => {
        this.isUploadable();
      });
    }
  }

  fileDeleted(fileRecord: any) {
    var i = this.fileRecordsForUpload.indexOf(fileRecord);
    if (i !== -1) {
      this.fileRecordsForUpload.splice(i, 1);
    }
  }
}
</script>

<!-- style lang="scss" scoped>
.theme-list .vue-file-agent .file-preview-wrapper .file-preview .file-delete{color:#777
/* updated value to show the 'x' better. was #777 */;
}
</style -->
