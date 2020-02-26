<template>
  <v-stepper-content step="2">
    <v-list :two-line="true">
      <v-subheader>{{
        storage_client && storage_client.accountName
      }}</v-subheader>
      <v-list-item
        v-for="container in containers"
        :key="container.properties.etag"
      >
        <v-list-item-content>
          <v-list-item-title>{{ container.name }}</v-list-item-title>
          <!-- Subtitle: Date of creation -->
          <v-list-item-subtitle>
            {{ container.properties.lastModified }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <!-- Action: Click to add -->
        <v-list-item-action>
          <v-btn icon @click="load_container(container.name)">
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
import {
  BlobServiceClient,
  ContainerItem,
  ContainerClient
} from "@azure/storage-blob";

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {
    storage_client: BlobServiceClient,
    containers: Array,
    error: String
  }
});

@Component({
  components: {}
})
export default class ContainerList extends Props {
  load_container(name: String) {
    this.$emit("load-container", name);
  }
}
</script>
