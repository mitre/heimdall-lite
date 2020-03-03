<template>
  <v-stepper v-model="step" vertical>
    <v-stepper-step :complete="!!storage_client" step="1">
      Account Credentials {{ step === 1 ? shown_error : "" }}
    </v-stepper-step>

    <AuthStepBasic
      v-bind:account_name.sync="account_name"
      v-bind:shared_access_signature.sync="shared_access_signature"
      v-bind:account_suffix.sync="account_suffix"
      v-bind:connection_string.sync="connection_string"
      @auth-basic="handle_basic"
    />

    <v-stepper-step :complete="!!container_client" step="2">
      Select Container {{ step === 2 ? shown_error : "" }}
    </v-stepper-step>

    <ContainerList
      :storage_client="storage_client"
      :containers="containers"
      @load-container="load_container"
    />

    <v-stepper-step step="3">
      Select Files {{ step === 3 ? shown_error : "" }}
    </v-stepper-step>

    <BlobList
      :container_client="container_client"
      :blobs="blobs"
      :prefix="blob_prefix"
      @load-container-blobs="load_container_blobs"
      @navigate-back-prefix="navigate_back_prefix"
      @add-item="add_item"
    />

    <LoadList
      :blobs="blobs_to_load"
      @load-files="load_files"
      @remove-item="remove_item"
    />
  </v-stepper>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import path from "path";
import { getModule } from "vuex-module-decorators";
import InspecIntakeModule, {
  FileID,
  next_free_file_ID
} from "@/store/report_intake";
import {
  BlobServiceClient,
  ContainerClient,
  BlobItem,
  BlobPrefix,
  ContainerItem
} from "@azure/storage-blob";
import AuthStepBasic from "@/components/global/upload_tabs/azure/AuthStepBasic.vue";
import BlobList from "@/components/global/upload_tabs/azure/BlobList.vue";
import LoadList from "@/components/global/upload_tabs/azure/LoadList.vue";
import ContainerList from "@/components/global/upload_tabs/azure/ContainerList.vue";
import {
  get_storage_client,
  get_container_client,
  list_blobs_hierarchy,
  list_blobs_flat,
  download_blob_file
} from "../../../../utilities/azure_util";

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {}
});

/**
 */
@Component({
  components: {
    AuthStepBasic,
    BlobList,
    LoadList,
    ContainerList
  }
})
export default class AzureReader extends Props {
  /** What error is currently shown, if any. Shared between stages. */
  error: string | null = null;

  /** Current step */
  step: number = 1;

  storage_client: BlobServiceClient | null = null;
  container_client: ContainerClient | null = null;
  containers: ContainerItem[] = [];

  /** Currently loaded blob list from container */
  blobs: (BlobItem | BlobPrefix)[] = [];

  /** List of blobs to load this is generated as users select files */
  blobs_to_load: (BlobItem | BlobPrefix)[] = [];

  /** The prefix of the blobs to load for BlobList */
  blob_prefix: string = "";

  /** A list of blob paths traversed. This is used by BlobList to go back. */
  prev_blob_prefixs: string[] = [];

  /** Form required field rules. Maybe eventually expand to other stuff */
  req_rule = (v: string | null | undefined) =>
    (v || "").trim().length > 0 || "Field is Required";

  /** State of all globally relevant fields */
  connection_string: string = "";
  account_name: string = "";
  shared_access_signature: string = "";
  account_suffix: string = "";

  get shown_error(): string {
    if (this.error) {
      return ` - ${this.error}`;
    } else {
      return "";
    }
  }

  /**
   * Handle a basic login.
   * Gets a storage client
   *
   * @affects
   *   this.storage_client is initialized with the given configuration
   */
  handle_basic() {
    // If we need another error, it will be set shortly. If not, the old one is probably not relevant
    this.error = null;
    let storage_client: BlobServiceClient;

    try {
      storage_client = get_storage_client(
        this.connection_string,
        this.account_name,
        this.shared_access_signature,
        this.account_suffix
      );
    } catch (error) {
      this.handle_error(error);
      return;
    }

    // try to fetch the properties to see if the storage client actually exists. The client only fails when data is actually fetched.
    storage_client.getProperties().then(
      success => {
        this.storage_client = storage_client;
        this.step = 2;
        this.load_containers();
      },
      err => {
        this.handle_error(err);
      }
    );
  }

  /**
   * Load all the containers for the given storage client.
   *
   * @affects
   *   this.containers is set to the containers in the currently loaded storage account.
   */
  async load_containers() {
    let containers: ContainerItem[] = [];

    if (!this.storage_client) {
      return;
    }

    for await (const container of this.storage_client.listContainers()) {
      containers.push(container);
    }

    this.containers = containers;
  }

  /**
   * Load all the blobs for the currently loaded container client.
   *
   * @affects
   *   this.blobs is set to the list of blobs in the container
   */
  async load_container_blobs(prefix: string = "") {
    this.blobs = [];

    if (!this.container_client) {
      this.step = 2;
      return;
    }

    this.prev_blob_prefixs.push(this.blob_prefix);
    this.blob_prefix = prefix;

    list_blobs_hierarchy(this.container_client, prefix)
      .then((blobs: (BlobPrefix | BlobItem)[]) => (this.blobs = blobs))
      .catch((err: any) => this.handle_error(err));
  }

  /**
   * List the blobs in the last container path that was searched.
   *
   * @affects
   *   this.blobs is set to the list of blobs in the container with the last prefix searched.
   */
  async navigate_back_prefix() {
    this.blobs = [];

    if (!this.container_client) {
      this.step = 2;
      return;
    }

    list_blobs_hierarchy(this.container_client, this.prev_blob_prefixs.pop())
      .then((blobs: (BlobPrefix | BlobItem)[]) => (this.blobs = blobs))
      .catch((err: any) => this.handle_error(err));
  }

  /**
   * Get the container client for the given container name.
   *
   * @param {string} name The name of the container to load.
   *
   * @affects
   *   this.container_client is set to the initialized container client.
   */
  async load_container(name: string) {
    if (!this.storage_client) {
      this.step = 1;
      return;
    }

    let container_client = get_container_client(this.storage_client, name);
    container_client.getProperties().then(
      success => {
        this.container_client = container_client;
        this.step = 3;
        this.load_container_blobs();
      },
      (err: any) => {
        this.handle_error(err);
      }
    );
  }

  /**
   * Callback to handle an Azure error.
   * Sets shown error.
   *
   * @param {any} error The error to display
   *
   * @affects
   *   this.error is set to the error
   */
  handle_error(error: any): void {
    this.error = error;
  }

  /**
   * Callback to handle adding a blob item or folder to the list of blobs to load.
   *
   * @param {BlobItem | BlobPrefix} item The file item or folder to eventually load.
   *
   * @affects
   *   this.blobs_to_load the item is appended to it
   */
  add_item(item: BlobItem | BlobPrefix) {
    this.blobs_to_load.push(item);
  }

  /**
   * Callback to handle removing the given blob item or prefix from the list of blobs to load. The item is matched based on the blob name.
   *
   * @param {BlobItem | BlobPrefix} item The item to remove from blobs to load.
   *
   * @affects
   *   this.blobs_to_load the item is remove from it
   */
  remove_item(item: BlobItem | BlobPrefix) {
    // fetch the index based on the element name.
    let idx = this.blobs_to_load.findIndex(elem => elem.name === item.name);
    if (idx != undefined) {
      this.blobs_to_load.splice(idx, 1);
    }
  }

  /**
   * Helper function to determine if the given object is a BlobItem. This is used for type checking between a BlobItem and a BlobPrefix.
   *
   * @param {BlobItem|BlobPrefix} object
   *
   * @return {bool} A boolean stating if the object is a blob item or not (ie blob prefix)
   */
  instanceOfBlobItem(object: BlobItem | BlobPrefix): object is BlobItem {
    return "properties" in object;
  }

  /**
   * Load all the files storage in this.blobs_to_load. This actually downloads the contents and loads the file into heimdall.
   *
   * @affects
   *   'got-files' is emitted with all the json files specified in this.blobs_to_load
   */
  async load_files() {
    if (!this.container_client) {
      this.step = 2;
      return;
    }
    let files = [];

    try {
      this.$emit("start-loading");

      for (let item of this.blobs_to_load) {
        // check if prefix or blob item
        if (this.instanceOfBlobItem(item)) {
          let fid = await this.load_file(item);
        } else {
          let blobs = await list_blobs_flat(this.container_client, item.name);
          for (let blob of blobs) {
            let fid = await this.load_file(blob);
            if (fid != undefined) files.push(fid);
          }
        }
      }

      this.$emit("stop-loading");
      this.$emit("got-files", files);
    } catch (error) {
      this.$emit("stop-loading");
      throw error;
    }
  }

  /**
   * Helper function to actually load a blob and initialize it as an inspec file
   *
   * @param {BlobItem} item The blob item to load.
   *
   * @return {Promise<FileID | void>} The file id for the inspec file or void if no file is loaded.
   */
  async load_file(item: BlobItem): Promise<FileID | void> {
    if (!this.container_client || path.extname(item.name) != ".json") {
      return new Promise((res, rej) => res());
    }

    // Generate file id for it, and prep module for load
    let unique_id = next_free_file_ID();
    let intake_module = getModule(InspecIntakeModule, this.$store);

    // Fetch it from azure, and promise to submit it to be loaded afterwards
    return download_blob_file(this.container_client, item.name)
      .then((content: String) => {
        return intake_module.loadText({
          text: content.valueOf(),
          filename: item.name!,
          unique_id
        });
      })
      .then(() => unique_id)
      .catch((failure: any) => this.handle_error(failure));
  }
}
</script>
