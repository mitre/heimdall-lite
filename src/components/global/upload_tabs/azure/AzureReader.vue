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
  Auth,
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

  blobs_to_load: (BlobItem | BlobPrefix)[] = [];

  blob_prefix: string = "";
  prev_blob_prefixs: string[] = [];

  /** Form required field rules. Maybe eventually expand to other stuff */
  req_rule = (v: string | null | undefined) =>
    (v || "").trim().length > 0 || "Field is Required";

  /** Passed from step 1 to step 2 (MFA) if necessary */
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
   * Gets a session token
   */
  handle_basic() {
    // If we need another error, it will be set shortly. If not, the old one is probably not relevant
    this.error = null;

    let storage_client = get_storage_client(
      this.connection_string,
      this.account_name,
      this.shared_access_signature,
      this.account_suffix
    );
    storage_client.getProperties().then(
      success => {
        console.log(storage_client);
        this.storage_client = storage_client;
        this.step = 2;
        this.load_containers();
      },
      err => {
        this.handle_error(err);
      }
    );
  }

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

  async load_container(name: string) {
    if (!this.storage_client) {
      this.step = 1;
      return;
    }

    let container_client = get_container_client(this.storage_client, name);
    container_client.getProperties().then(
      success => {
        console.log(container_client);
        this.container_client = container_client;
        this.step = 3;
        this.load_container_blobs();
      },
      (err: any) => {
        this.handle_error(err);
      }
    );
  }

  /** Callback to handle an Azure error.
   * Sets shown error.
   */
  handle_error(error: any): void {
    this.error = error;
  }

  add_item(item: BlobItem | BlobPrefix) {
    this.blobs_to_load.push(item);
    console.log(this.blobs_to_load);
  }

  remove_item(item: BlobItem | BlobPrefix) {
    let idx = this.blobs_to_load.findIndex(elem => elem.name === item.name);
    if (idx != undefined) {
      this.blobs_to_load.splice(idx, 1);
    }
  }

  instanceOfBlobItem(object: any): object is BlobItem {
    return "properties" in object;
  }

  async load_files() {
    if (!this.container_client) {
      this.step = 2;
      return;
    }
    let files = [];

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

    this.$emit("got-files", files);
  }

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
