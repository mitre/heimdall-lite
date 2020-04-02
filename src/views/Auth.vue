<template>
  <v-container>
    <v-row>
      <v-col center xl="8" md="8" sm="12" xs="12">
        <LoginModal v-model="dialog" @logged-in="on_login" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Filter } from "@/store/data_filters";
import { FileID } from "@/store/report_intake";
import { LocalStorageVal } from "@/utilities/helper_util";
import { getModule } from "vuex-module-decorators";
import LoginModal from "@/components/global/LoginModal.vue";

// We declare the props separately
// to make props types inferrable.
const AuthProps = Vue.extend({
  props: {}
});

@Component({
  components: {
    LoginModal
  }
})
export default class Auth extends AuthProps {
  /** Whether or not the model is showing */
  dialog: boolean = true;

  /**
   * Invoked when file(s) are loaded.
   */
  on_login() {
    console.log("logged in - go to root");
    // Close the dialog
    this.dialog = false;
    this.$router.push("/home");
  }
}
</script>
