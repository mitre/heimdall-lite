<template>
  <v-app id="inspire" style="background: var(--v-background-base)">
    <!-- Top+Sidebar -->
    <Sidebar v-model="drawer" />
    <Topbar @toggle-drawer="drawer = !drawer" />

    <v-content>
      <Toolbar />
      <router-view></router-view>
    </v-content>

    <v-btn
      bottom
      color="teal"
      dark
      fab
      fixed
      right
      @click="dialog = !dialog"
      :hidden="dialog"
    >
      <v-icon>add</v-icon>
    </v-btn>

    <Modal :dialog="dialog" @modal-dismissed="dialog = false" />

    <v-spacer />
    <Footer />
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Sidebar from "@/components/global/Sidebar.vue";
import Topbar from "@/components/global/Topbar.vue";
import Toolbar from "@/components/global/Toolbar.vue";
import Modal from "@/components/global/Modal.vue";
import Footer from "@/components/global/Footer.vue";
import ColorHackModule from "@/store/color_hack";

// We declare the props separately
// to make props types inferable.
const AppProps = Vue.extend({
  props: {
    source: String
  }
});

@Component({
  components: {
    Sidebar,
    Topbar,
    Toolbar,
    Footer,
    Modal
  }
})
export default class App extends AppProps {
  drawer: boolean = false;
  dialog: boolean = false;

  get background() {
    return "background";
  }
}
</script>

<style>
.theme--light.v-card,
.theme--light.v-sheet,
.theme--light.v-navigation-drawer {
  background: var(--v-background-lighten1);
}
</style>
