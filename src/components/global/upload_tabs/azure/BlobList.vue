<template>
  <v-stepper-content step="3">
    <v-list :two-line="true">
      <v-subheader>
        <v-btn icon @click="() => navigate_back_prefix()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        {{ container_client && container_client.accountName }}/{{ prefix }}
      </v-subheader>
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
            {{ blob.name }}
          </v-list-item-title>
          <!-- Subtitle: Date of creation -->
          <v-list-item-subtitle v-if="blob.kind === 'blob'">
            {{ blob.properties.lastModified }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <!-- Action: Click to add -->
        <v-list-item-action>
          <v-btn icon @click="() => add_item(blob)">
            <v-icon>mdi-plus-circle</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-stepper-content>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ContainerClient, BlobItem, BlobPrefix } from "@azure/storage-blob";

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {
    container_client: ContainerClient,
    prefix: String,
    prev_prefix: String,
    blobs: Array, // List of Blob objects of current files
    error: String
  }
});

@Component({
  components: {}
})
export default class BlobList extends Props {
  load_container_blobs(prefix: string) {
    this.$emit("load-container-blobs", prefix);
  }

  add_item(item: BlobItem | BlobPrefix) {
    this.$emit("add-item", item);
  }

  navigate_back_prefix() {
    this.$emit("navigate-back-prefix");
  }
}
</script>
