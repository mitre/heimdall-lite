<template>
  <v-dialog v-model="dialog" width="75%">
    <!-- clickable slot passes the activator prop up to parent 
        This allows the parent to pass in a clickable icon -->
    <template v-slot:activator="{on}">
      <slot name="clickable" v-bind:on="on"> </slot>
    </template>

    <v-card>
      <v-card-title class="headline grey" primary-title
        >How to Load your Azure Blob Data</v-card-title
      >

      <v-card-text>
        <br />

        <h2>
          Load data using Azure Blob Service. To set up this connection, you
          will need to use your
          <a target="_blank" href="https://portal.azure.com/">Azure Portal</a>.
        </h2>
        <br />
        <br />
        <br />
        <h2>1. Navigate to you Azure Storage Account.</h2>
        <br />
        <v-img src="@/assets/storageAccountNav.png" />
        <br />
        <hr />
        <br />
        <h2>
          2. Navigate to Containers, and make sure your container has at least
          Blob level access.
        </h2>
        <br />
        <v-img src="@/assets/containerNav.png" />
        <br />
        <v-img src="@/assets/containers.png" />
        <br />
        <v-img src="@/assets/changeAccessLevel.png" />
        <br />
        <hr />
        <br />
        <h2>
          3. Navigate to CORS in the sidebar. Then set Allowed origin to
          "Heimdall-lite.com", Allowed headers to *, and set Allowed methods to
          GET,HEAD.
        </h2>
        <br />
        <v-img src="@/assets/CORS.png" />
        <br />
        <hr />
        <br />
        <h2>
          4. Navigate to Shared access signature in the sidebar. Select Service,
          Container, and Object for Allowed resource type.
        </h2>
        <br />
        <v-img src="@/assets/resourceTypes.png" />
        <br />
        <hr />
        <br />
        <h2>
          5. Click "Generate SAS and connection" string to get your SAS token
          and Connection String.
        </h2>
        <br />
        <v-img src="@/assets/connectionAndSAS.png" />
        <br />
        <hr />
        <br />
        <h2>
          6. Copy and paste your connection string into Heimdall-lite.
        </h2>
        <br />
        <v-img src="@/assets/HeimdallAzureConnection.png" />
        <br />
        <hr />
        <br />
        <h2>
          7. Select the container and files you wish to load.
        </h2>
        <br />
        <v-img src="@/assets/selectContainer.png" />
        <br />
        <v-img src="@/assets/selectAzurefile.png" />
        <br />
        <v-img src="@/assets/loadAzureFile.png" />
        <br />
        <hr />
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn color="primary" text @click="dialog = false">Close Window</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import {getModule} from 'vuex-module-decorators';
import AppInfoModule from '@/store/app_info';

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {}
});
@Component({
  components: {}
})
export default class HelpModal extends Props {
  dialog: boolean = false;
}
</script>
