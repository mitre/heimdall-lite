<template>
  <v-dialog v-model="dialog" width="75%">
    <!-- clickable slot passes the activator prop up to parent 
        This allows the parent to pass in a clickable icon -->
    <template v-slot:activator="{on}">
      <slot name="clickable" v-bind:on="on"> </slot>
    </template>

    <v-card>
      <v-card-title class="headline grey" primary-title
        >How to Load your S3 Bucket Data</v-card-title
      >

      <v-card-text>
        <br />

        <h2>
          Load data using
          <a target="_blank" href="https://console.aws.amazon.com/console/home">
            Amazon S3</a
          >.
        </h2>
        <br />
        <br />
        <br />
        <h2>
          1. Navigate to "My Security Credentials" in your account dropdown
          menu.
        </h2>
        <br />
        <v-img src="@/assets/accountMenu.png" />
        <br />
        <hr />
        <br />
        <h2>
          2. Navigate to Access Keys, and select "Create New Access Key" to get
          your Access Key ID and Secret Access Key.
        </h2>
        <br />
        <v-img src="@/assets/createNewKey.png" />
        <br />
        <v-img src="@/assets/newKeys.png" />
        <br />
        <hr />
        <br />
        <h2>
          3. Navigate to your S3 buckets and select the bucket from which you
          would like to load your data.
        </h2>
        <br />
        <v-img src="@/assets/bucketList.png" />
        <br />
        <hr />
        <br />
        <h2>
          4. You can now get what region your bucket is by checking the url, in
          this case "us-east-2".
        </h2>
        <br />
        <v-img src="@/assets/regionURL.png" />
        <br />
        <hr />
        <br />
        <h2>
          5. Navigate to Permissions and then CORS Configuration. Next, match
          the configuration below, but replace "*" in AllowedOrigin with your
          Heimdall domain.
        </h2>
        <br />
        <v-img src="@/assets/CORSCon.png" />
        <br />
        <hr />
        <br />
        <h2>
          6. Imput the Region and Access keys and select "Basic Login".
        </h2>
        <br />
        <v-img src="@/assets/basicLogin.png" />
        <br />
        <hr />
        <br />
        <h2>
          7. Type in the name of the bucket and proess the button with the load
          icon.
        </h2>
        <br />
        <v-img src="@/assets/searchBucket.png" />
        <br />
        <hr />
        <br />
        <h2>
          8. Select the files you wish to load.
        </h2>
        <br />
        <v-img src="@/assets/selectFiles.png" />
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
export default class AWSHelpModal extends Props {
  dialog: boolean = false;
}
</script>
