<template>
  <v-stepper-content step="2">
    <v-form v-model="valid">
      <v-text-field
        :value="mfa_token"
        @input="change_mfa_token"
        label="MFA Token"
        :rules="[req_rule]"
      />
      <v-text-field
        :value="mfa_serial"
        @input="change_mfa_serial"
        label="MFA Device ARN (Optional)"
        hint="Defaults to virtual IAM device"
      />
      <v-btn color="red" @click="$emit('exit-mfa')" class="my-2 mr-3">
        Cancel
      </v-btn>
      <v-btn
        color="primary"
        :disabled="!valid"
        class="my-2 mr-3"
        @click="$emit('auth-mfa', [form_mfa_serial, form_mfa_token])"
      >
        Login
      </v-btn>
    </v-form>
  </v-stepper-content>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import S3, { ObjectKey } from "aws-sdk/clients/s3";
import { AWSError } from "aws-sdk/lib/error";
import { LocalStorageVal } from "../../../../utilities/helper_util";
import {
  Auth,
  transcribe_error,
  get_session_token,
  MFA_Info
} from "../../../../utilities/aws_util";
import InspecIntakeModule, { FileID } from "@/store/report_intake";

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {
    error: String, // What error to show
    mfa_serial: String,
    mfa_token: String
  }
});

/** Localstorage keys */
const local_mfa_serial = new LocalStorageVal<string>("aws_s3_mfa_serial");

/**
 * File reader component for taking in inspec JSON data.
 * Uploads data to the store with unique IDs asynchronously as soon as data is entered.
 * Emits "got-files" with a list of the unique_ids of the loaded files.
 */
@Component({})
export default class S3Reader extends Props {
  /** Models if currently displayed form is valid.
   * Shouldn't be used to interpret literally anything else as valid - just checks fields filled
   */
  valid: boolean = false;

  /** Form required field rules. Maybe eventually expand to other stuff */
  req_rule = (v: string | null | undefined) =>
    (v || "").trim().length > 0 || "Field is Required";

  /** On mount, try to look up stored auth info */
  mounted() {
    this.change_mfa_serial(local_mfa_serial.get_default(""));
  }

  /** Handles changes to mfa serial */
  change_mfa_token(new_value: string) {
    this.$emit("update:mfa_token", new_value);
  }

  /** Handles changes to mfa token */
  change_mfa_serial(new_value: string) {
    local_mfa_serial.set(new_value);
    this.$emit("update:mfa_serial", new_value);
  }
}
</script>