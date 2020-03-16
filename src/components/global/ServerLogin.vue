<template>
  <v-container grid-list-md>
    <v-layout row wrap align-center justify-center fill-height>
      <v-flex xs12 sm8 lg4 md5>
        <v-card class="login-card">
          <v-card-title>
            <span class="headline">Login to Heimdall</span>
          </v-card-title>

          <v-spacer />

          <v-card-text>
            <v-layout
              row
              fill-height
              justify-center
              align-center
              v-if="loading"
            >
              <v-progress-circular :size="50" color="primary" indeterminate />
            </v-layout>

            <v-form v-else ref="form" v-model="valid" lazy-validation>
              <v-container>
                <v-text-field
                  v-model="username"
                  label="email address"
                  maxlength="70"
                  required
                />

                <v-text-field
                  type="password"
                  v-model="password"
                  label="password"
                  maxlength="70"
                  required
                />
                <!-- :counter="20" -->

                <v-text-field
                  v-model="host"
                  label="host"
                  maxlength="200"
                  required
                />
              </v-container>
              <v-btn class="pink white--text" :disabled="!valid" @click="login"
                >Login</v-btn
              >
            </v-form>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import ServerModule from "@/store/server";

// TODO: Swap to sweetalert2?

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {}
});

@Component({
  components: {}
})
export default class ServerLogin extends Props {
  // The fields
  username: string = "";
  password: string = "";
  host: string = "";

  // Whether fields are valid
  valid = true;

  // Whether we're currently loading
  loading = false;

  username_rules = [
    (v: string) => !!v || "Username is required"
    // (v: string) => (v && v.length > 3) || "A username must be more than 3 characters long",
    // (v: string) => /^[a-z0-9_]+$/.test(v) || "A username can only contain letters and digits"
  ];
  password_rules = [
    (v: string) => !!v || "Password is required"
    // (v: string) => (v && v.length > 7) || "The password must be longer than 7 characters"
  ];

  async login(): Promise<void> {
    // checking if the input is valid
    if ((this.$refs.form as any).validate()) {
      this.loading = true;
      let mod = getModule(ServerModule, this.$store);
      await mod
        .connect(this.host)
        .catch(bad => {
          console.error(`Unable to connect to ${this.host}`);
          throw bad;
        })
        .then(() => {
          return mod.login(this.username, this.password);
        })
        .catch(bad => {
          console.error(`bad login ${bad}`);
          throw bad;
        })
        .then(() => {
          console.log("Good!");
          console.log(mod.token);
        });
    }
  }
}
</script>
