<template>
  <v-stepper-content step="3">
    <v-list :two-line="true">
      <v-subheader>Files To Load</v-subheader>
      <v-list-item v-for="blob in blobs" :key="blob.name">
        <v-list-item-content>
          <v-list-item-title>
            <v-btn
              icon
              v-if="blob.kind === 'prefix'"
              @click="() => load_container_blobs(blob.name)"
            >
              <v-icon>mdi-folder</v-icon>
            </v-btn>
            {{ basename(blob.name) }}
          </v-list-item-title>
          <!-- Subtitle: Date of creation -->
          <v-list-item-subtitle v-if="blob.kind === 'blob'">
            {{ blob.properties.lastModified }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <!-- Action: Click to add -->
        <v-list-item-action>
          <v-btn icon @click="() => remove_item(blob)">
            <v-icon>mdi-close-circle</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-btn
      color="primary"
      :disabled="blobs.length <= 0"
      @click="$emit('load-files')"
      class="my-2 mr-3"
    >
      Load
    </v-btn>
  </v-stepper-content>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import path from 'path';
import {BlobItem, BlobPrefix} from '@azure/storage-blob';

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {
    blobs: Array, // List of Blob objects of current files
    error: String
  }
});

@Component({
  components: {}
})
export default class BlobList extends Props {
  /**
   * Helper function to load the given container blobs. This is so the user can interact between the files list and load list.
   *
   * @param {string} prefix The prefix for the folder to load.
   *
   * @affects
   *   "load-container-blobs" is emmitted with the prefix
   */
  load_container_blobs(prefix: string) {
    this.$emit('load-container-blobs', prefix);
  }

  /**
   * Helper function to remove the given item from the list of blobs to load.
   *
   * @param {BlobItem | BlobPrefix} item The name of the blob to remove
   *
   * @affects
   *   "remove-item" is emmitted with the blob item
   */
  remove_item(item: BlobItem | BlobPrefix) {
    this.$emit('remove-item', item);
  }

  /**
   * Helper function to get the basename of a path.
   *
   * @param {String} str The path
   *
   * @return {String} The basename of the path
   *   "load-container" is emmitted with the value name
   */
  basename(str: String): String {
    return path.basename(str.valueOf());
  }
}
</script>
