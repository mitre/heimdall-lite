<template>
  <v-stepper-content step="1">
    <br />
    <v-form>
      <v-select
        :items="auth_methods"
        v-model="auth_method_model"
        @change="change_auth_method"
        return-object
        item-text="text"
        item-value="value"
        label="Select Auth Method"
        dense
      ></v-select>
    </v-form>
    <v-form v-model="valid">
      <v-text-field
        :value="container_name"
        @input="change_container_name"
        label="Container Name (optional)"
        lazy-validation="lazy"
        :rules="[]"
      />
    </v-form>
    <v-form
      v-model="valid"
      v-if="auth_method_model && auth_method_model.value == 'sas'"
    >
      <v-text-field
        :value="account_name"
        @input="change_account_name"
        label="Storage Account Name"
        lazy-validation="lazy"
        :rules="[req_rule]"
      />
      <v-text-field
        :value="account_suffix"
        @input="change_account_suffix"
        label="Account Suffix"
        lazy-validation="lazy"
        :rules="[req_rule]"
      />
      <v-text-field
        :value="shared_access_signature"
        @input="change_shared_access_signature"
        label="Shared Access Signature"
        :rules="[req_rule]"
        :append-icon="show_secret ? 'mdi-eye' : 'mdi-eye-off'"
        :type="show_secret ? 'text' : 'password'"
        @click:append="show_secret = !show_secret"
      />
      <v-text-field
        :value="get_full_account_url()"
        label="Full Storage Account URL"
        readonly
        outlined
      />
    </v-form>
    <v-form
      v-model="valid_conn_string"
      v-if="auth_method_model && auth_method_model.value == 'conn_string'"
    >
      <v-text-field
        :value="connection_string"
        @input="change_connection_string"
        label="Connection String"
        lazy-validation="lazy"
        :rules="[req_rule]"
      />
    </v-form>
    <v-btn
      color="primary"
      :disabled="!(valid || valid_conn_string)"
      @click="$emit('auth-basic')"
      class="my-2 mr-3"
    >
      Login
    </v-btn>
  </v-stepper-content>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {LocalStorageVal} from '../../../../utilities/helper_util';
import {get_blob_account_url} from '../../../../utilities/azure_util';
import {Dictionary} from 'vue-router/types/router';

type MultipleSelectObject = {
  value: string;
  text: string;
};

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {
    auth_method: String,
    account_name: String,
    connection_string: String,
    container_name: String,
    account_suffix: String,
    shared_access_signature: String
  }
});

/** Localstorage keys */
const local_auth_method = new LocalStorageVal<MultipleSelectObject>(
  'azure_auth_method'
);
const local_account_name = new LocalStorageVal<string>('azure_account_name');
const local_connection_string = new LocalStorageVal<string>(
  'azure_connection_string'
);
const local_container_name = new LocalStorageVal<string>(
  'azure_container_name'
);
const local_shared_access_signature = new LocalStorageVal<string>(
  'azure_blob_shared_access_signature'
);
const local_account_suffix = new LocalStorageVal<string>(
  'azure_blob_account_suffix'
);

/**
 */
@Component({
  components: {}
})
export default class AuthStepBasic extends Props {
  /** Models if currently displayed form is valid.
   * Shouldn't be used to interpret literally anything else as valid - just checks fields filled
   */
  valid: boolean = false;
  valid_conn_string: boolean = false;
  show_secret: boolean = false;
  auth_methods: Array<MultipleSelectObject> = [
    {
      text: 'Connection String',
      value: 'conn_string'
    },
    {
      text: 'SAS Token',
      value: 'sas'
    }
  ];
  auth_method_model: MultipleSelectObject | null = null;

  /** Form required field rules. Maybe eventually expand to other stuff */
  req_rule = (v: string | null | undefined) =>
    (v || '').trim().length > 0 || 'Field is Required';

  /**
   * Helper function to generate the full connection url from the storage account name, suffix, and SAS token
   *
   * @return {string} the url
   */
  get_full_account_url(): string {
    return get_blob_account_url(
      this.account_name,
      this.account_suffix,
      this.shared_access_signature
    );
  }

  /**
   * Callback for a change in auth method
   *
   * @param {string} new_value The new value for auth_method
   *
   * @affects
   *   update:local_auth_method emmitted with the new_value
   *   local_auth_method is set to new_value
   */
  change_auth_method(new_value: MultipleSelectObject) {
    this.auth_method_model = new_value;
    local_auth_method.set(new_value);
    this.$emit('update:auth_method', new_value.value);
  }

  /**
   * Callback for a change in account suffix
   *
   * @param {string} new_value The new value for account_suffix
   *
   * @affects
   *   update:account_suffix emmitted with the new_value
   *   local_account_suffix is set to new_value
   */
  change_account_suffix(new_value: string) {
    local_account_suffix.set(new_value);
    this.$emit('update:account_suffix', new_value);
  }

  /**
   * Callback for a change in account name
   *
   * @param {string} new_value The new value for account_name
   *
   * @affects
   *   update:account_name emmitted with the new_value
   *   local_account_name is set to new_value
   */
  change_account_name(new_value: string) {
    local_account_name.set(new_value);
    this.$emit('update:account_name', new_value);
  }

  /**
   * Callback for a change in connection string
   *
   * @param {string} new_value The new value for connection_string
   *
   * @affects
   *   update:connection_string emmitted with the new_value
   *   local_connection_string is set to new_value
   */
  change_connection_string(new_value: string) {
    local_connection_string.set(new_value);
    this.$emit('update:connection_string', new_value);
  }

  /**
   * Callback for a change in container name
   *
   * @param {string} new_value The new value for container_name
   *
   * @affects
   *   update:container_name emmitted with the new_value
   *   local_container_name is set to new_value
   */
  change_container_name(new_value: string) {
    local_container_name.set(new_value);
    this.$emit('update:container_name', new_value);
  }

  /**
   * Callback for a change in sas token
   *
   * @param {string} new_value The new value for shared_access_signature
   *
   * @affects
   *   update:shared_access_signature emmitted with the new_value
   *   local_shared_access_signature is set to new_value
   */
  change_shared_access_signature(new_value: string) {
    local_shared_access_signature.set(new_value);
    this.$emit('update:shared_access_signature', new_value);
  }

  /** On mount, try to look up stored auth info */
  mounted() {
    // Load our credentials
    this.change_auth_method(
      local_auth_method.get_default(this.auth_methods[0])
    );
    this.change_account_suffix(local_account_suffix.get_default(''));
    this.change_account_name(local_account_name.get_default(''));
    this.change_connection_string(local_connection_string.get_default(''));
    this.change_container_name(local_container_name.get_default(''));
    this.change_shared_access_signature(
      local_shared_access_signature.get_default('')
    );
  }
}
</script>
