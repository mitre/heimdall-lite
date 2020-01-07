<template>
  <v-stepper-content step="1">
    <v-form v-model="valid">
      <v-text-field
        :value="username"
        @input="$emit('update:username', $event)"
        label="Username"
        :rules="[req_rule]"
      />
      <v-text-field
        :value="password"
        @input="$emit('update:password', $event)"
        label="Password"
        :rules="[req_rule]"
        :append-icon="show_secret ? 'mdi-eye' : 'mdi-eye-off'"
        :type="show_secret ? 'text' : 'password'"
        @click:append="show_secret = !show_secret"
      />
      <v-text-field
        :value="hostname"
        @input="$emit('update:hostname', $event)"
        label="Hostname"
        :rules="[req_rule]"
        hint="Ex: https://my.website.com:8089"
      />
    </v-form>
    <v-btn
      color="primary"
      :disabled="!valid"
      @click="$emit('auth')"
      class="my-2"
    >
      Login
    </v-btn>
  </v-stepper-content>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import S3, { ObjectKey } from "aws-sdk/clients/s3";
import { LocalStorageVal } from "../../../../utilities/helper_util";
import InspecIntakeModule, { FileID } from "@/store/report_intake";
import FileList from "@/components/global/upload_tabs/aws/FileList.vue";

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {
    username: String,
    password: String,
    hostname: String
  }
});

/**
 *
 */
@Component({
  components: {
    FileList
  }
})
export default class S3Reader extends Props {
  /** Models if currently displayed form is valid.
   * Shouldn't be used to interpret literally anything else as valid - just checks fields filled
   */
  valid: boolean = false;
  show_secret: boolean = false;

  /** Form required field rules. Maybe eventually expand to other stuff */
  req_rule = (v: string | null | undefined) =>
    (v || "").trim().length > 0 || "Field is Required";
}
</script>
