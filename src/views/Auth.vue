<template>
  <v-container>
    <v-row>
      <v-col center xl="8" md="8" sm="12" xs="12">
        <v-card>
          <v-card-title class="headline grey" primary-title>
            Login to Heimdall Server
          </v-card-title>

          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
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
          <v-divider></v-divider>
        </v-card>
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
import ServerModule from "@/store/server";

export interface LoginHash {
  username: string;
  password: string;
}

// We declare the props separately
// to make props types inferrable.
const AuthProps = Vue.extend({
  props: {}
});

@Component({
  components: {}
})
export default class Auth extends AuthProps {
  username: string = "";
  password: string = "";
  host: string = "";

  // Whether fields are valid
  valid = true;

  // Whether we're currently loading
  //loading = false;

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
      console.log("Login to " + this.host);
      let creds: LoginHash = {
        username: this.username,
        password: this.password
      };
      //this.loading = true;
      let mod = getModule(ServerModule, this.$store);
      await mod
        .connect(this.host)
        .catch(bad => {
          console.error("Unable to connect to " + this.host);
          throw bad;
        })
        .then(() => {
          return mod.login(creds);
        })
        .catch(bad => {
          console.error(`bad login ${bad}`);
          throw bad;
        })
        .then(() => {
          console.log("Good!");
          console.log(mod.token);
          this.$router.push("/home");
        });
    }
  }
}
</script>
