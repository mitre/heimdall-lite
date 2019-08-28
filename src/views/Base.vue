<!--    This is the "base view" that we just modify with slots.
        Saves us the trouble of messing around with -->
<template>
  <div>
    <!-- Top+Sidebar -->
    <Topbar @toggle-drawer="drawer = !drawer">
      <template #content>
        <slot name="topbar-content" />
      </template>
    </Topbar>

    <v-content>
      <slot name="content" />
    </v-content>

    <slot name="extra" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Sidebar from "@/components/global/Sidebar.vue";
import Topbar from "@/components/global/Topbar.vue";
import Footer from "@/components/global/Footer.vue";

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
    Footer
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
