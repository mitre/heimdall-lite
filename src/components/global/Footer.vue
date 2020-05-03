<template>
  <v-footer app title="footer" class="bar font-weight-light">
    <span class="bar-visible--text">The MITRE Corporation &copy; 2019</span>
    <HelpFooter />
  </v-footer>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import HelpFooter from "@/components/global/upload_tabs/HelpFooter.vue";

// We declare the props separately to make props types inferable.
const FooterProps = Vue.extend({
  props: {}
});

@Component({
  components: {
    HelpFooter
  }
})
export default class Footer extends FooterProps {}
</script>
