<template>
  <v-app id="inspire" style="background: var(--v-background-base)">
    <!-- Sidebar to naviage between things -->
    <Sidebar v-model="drawer" />

    <!-- Router view -->
    <router-view></router-view>

    <!-- Footer -->
    <v-spacer />
    <Footer />
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Sidebar from "@/components/global/Sidebar.vue";
import Footer from "@/components/global/Footer.vue";

// We declare the props separately
// to make props types inferable.
const AppProps = Vue.extend({});

@Component({
  components: {
    Sidebar,
    Footer
  }
})
export default class App extends AppProps {}
</script>

<style>
.theme--light.v-card,
.theme--light.v-sheet,
.theme--light.v-navigation-drawer {
  background: var(--v-background-lighten1);
}
</style>
