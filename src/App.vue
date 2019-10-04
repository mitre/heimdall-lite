<template>
  <v-app id="inspire" class="override">
    <!-- Router view. Typically a "subclass" of Base -->
    <router-view></router-view>

    <!-- Footer -->
    <v-spacer />
    <Footer />
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Footer from "@/components/global/Footer.vue";

// We declare the props separately
// to make props types inferable.
const AppProps = Vue.extend({});

@Component({
  components: {
    Footer
  }
})
export default class App extends AppProps {}
</script>

<!-- Style to fix dark mode to use our color scheme -->
<style>
/* Backgrounds (root) */
.override.theme--dark.v-application {
  background: var(--v-secondary-base);
}

.override.theme--light.v-application {
  background: var(--v-secondary-base);
}

/** Backgrounds (middle) */
.override .theme--dark.v-card,
.override .theme--dark.v-navigation-drawer {
  background: var(--v-secondary-lighten1);
  background-color: var(--v-secondary-lighten1);
}

.override .theme--light.v-card,
.override .theme--light.v-navigation-drawer {
  background: var(--v-secondary-lighten1);
  background-color: var(--v-secondary-lighten1);
}

/** Foreground */
.foreground .v-card {
  background: var(--v-secondary-lighten2) !important;
  background-color: var(--v-secondary-lighten2) !important;
}

/** Bar */
.v-app-bar,
.v-toolbar,
.v-footer {
  background: var(--v-primary-base);
  background-color: var(--v-primary-base);
}
</style>
