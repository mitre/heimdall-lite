<template>
  <v-container class="bar">
    <v-row justify="space-around" no-gutters>
      <div :href="repository" target="_blank" text small>
        <img
          src="@/assets/logo-orange-tsp.svg"
          svg-inline
          style="max-width: 60px; max-height: 60px;"
        />
        <h1 class="d-none d-sm-inline pl-3">Heimdall Lite</h1>
      </div>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import HelpModal from "@/components/global/HelpModal.vue";
import AboutModal from "@/components/global/AboutModal.vue";
import AppInfoModule from "@/store/app_info";
// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {}
});
/**
 * File reader component for taking in inspec JSON data.
 * Uploads data to the store with unique IDs asynchronously as soon as data is entered.
 * Emits "got-files" with a list of the unique_ids of the loaded files.
 */
@Component({
  components: {
    AboutModal,
    HelpModal
  }
})
export default class Header extends Props {
  get version(): string {
    return getModule(AppInfoModule, this.$store).version;
  }
  get changelog(): string {
    return getModule(AppInfoModule, this.$store).changelog;
  }
  get repository(): string {
    return getModule(AppInfoModule, this.$store).repository;
  }
  get branch(): string {
    return getModule(AppInfoModule, this.$store).branch;
  }
}
</script>
