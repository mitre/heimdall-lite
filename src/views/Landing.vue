<template>
  <v-container>
    <v-row>
      <v-col style="margin: auto" center xl="8" md="8" sm="12" xs="12">
        <UploadNexusNew
          :value="dialog"
          @got-files="on_got_files"
          :persistent="true"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import UploadNexus from "@/components/global/UploadNexus.vue";
import UploadNexusNew from "@/components/global/UploadNexusNew.vue";
import ServerModule from "@/store/server";
import { getModule } from "vuex-module-decorators";
import HelpFooter from "@/components/global/upload_tabs/HelpFooter.vue";

import { Filter } from "@/store/data_filters";
import { FileID } from "@/store/report_intake";

// We declare the props separately
// to make props types inferrable.
const LandingProps = Vue.extend({
  props: {}
});

@Component({
  components: {
    UploadNexusNew,
    UploadNexus,
    HelpFooter
  }
})
export default class Landing extends LandingProps {
  /** Whether or not the model is showing */
  dialog: boolean = true;

  /* This is supposed to cause the dialog to automatically appear if there is
   * no file uploaded
   */
  mounted() {
    //this.checkLoggedIn();
  }

  get is_logged_in(): boolean {
    if (this.token) {
      console.log("is_logged_in - token: " + this.token + "end token");
      return true;
    } else {
      return false;
    }
  }

  get token(): string {
    let mod = getModule(ServerModule, this.$store);
    return mod.token || "";
  }

  checkLoggedIn() {
    console.log("token: " + this.token + "end token");
    if (!this.token) {
      console.log("Go to auth");
      this.dialog = false;
      this.$router.push("/login");
    }
  }

  /**
   * Invoked when file(s) are loaded.
   */
  on_got_files(ids: FileID[]) {
    // Close the dialog
    this.dialog = false;

    // If just one file, focus it
    if (ids.length === 1) {
      this.$router.push(`/results/${ids[0]}`);
    }

    // If more than one, focus all.
    // TODO: Provide support for focusing a subset of files
    else if (ids.length > 1) {
      this.$router.push(`/results/all`);
    }
  }
}
</script>
