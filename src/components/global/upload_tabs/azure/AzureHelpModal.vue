<template>
  <v-dialog :value="value" @input="forwardModal" width="75%">
    <!-- clickable slot passes the activator prop up to parent 
        This allows the parent to pass in a clickable icon -->

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
          2. Navigate to CORS in the sidebar. Then set Allowed origin to your
          host location, in our case 'Heimdall-lite.mitre.org', Allowed headers
          to *, and set Allowed methods to GET,HEAD.
        </h2>
        <br />
        <v-img src="@/assets/CORS.png" />
        <br />
        <hr />
        <br />
        <h2>
          3. Navigate to Shared access signature in the sidebar. Select Service,
          Container, and Object for Allowed resource type.
        </h2>
        <br />
        <v-img src="@/assets/resourceTypes.png" />
        <br />
        <hr />
        <br />
        <h2>
          4. Click "Generate SAS and connection" string to get your SAS token
          and Connection String.
        </h2>
        <br />
        <v-img src="@/assets/connectionAndSAS.png" />
        <br />
        <hr />
        <br />
        <h2>
          5. Copy and paste your connection string into Heimdall-lite.
        </h2>
        <br />
        <v-img src="@/assets/HeimdallAzureConnection.png" />
        <br />
        <hr />
        <br />
        <h2>
          6. Select the container and files you wish to load.
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
        <v-btn color="primary" text @click="forwardModal(false)"
          >Close Window</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import {getModule} from 'vuex-module-decorators';
import {AppInfoModule} from '@/store/app_info';

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {
    value: Boolean
  }
});
@Component({
  components: {}
})
export default class HelpModal extends Props {
  forwardModal(show: boolean) {
    this.$emit('input', show);
  }
}
</script>
