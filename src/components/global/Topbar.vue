<template>
  <v-app-bar :clipped-left="$vuetify.breakpoint.lgAndUp" app color="bar">
    <!-- The title and nav bar -->
    <v-toolbar-title class="pr-2">
      <v-app-bar-nav-icon @click.stop="$emit('toggle-drawer')">
        <v-icon color="bar-visible">
          mdi-menu
        </v-icon>
      </v-app-bar-nav-icon>
      <span class="hidden-sm-and-down bar-visible--text">
        {{ title }}
      </span>
    </v-toolbar-title>
    <v-spacer />

    <!-- Our customizable content -->
    <slot></slot>

    <!-- Login information or whatever -->
    <v-btn icon large>
      <v-avatar size="32px" item>
        <v-img
          :src="require('@/assets/logo-xs-orange-white.svg')"
          alt="Heimdall Logo"
        ></v-img>
      </v-avatar>
    </v-btn>
    <v-btn icon large v-on:click="darkMode">
      <v-icon v-if="this.$vuetify.theme.dark">mdi-brightness-7</v-icon>
      <v-icon color="white" v-else>mdi-brightness-4</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

// We declare the props separately to make props types inferable.
const TopbarProps = Vue.extend({
  props: {
    title: String
  }
});

@Component({
  components: {}
})
export default class Topbar extends TopbarProps {
  /** Submits an event to clear all filters */
  clear(): void {
    this.$emit("clear");
  }
  darkMode() {
    let metaThemeColor = document.querySelector("meta[name=theme-color]");
    this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    // if (localStorage)
    //   localStorage.setItem("darkMode", this.$vuetify.theme.dark);
    // if (this.$vuetify.theme.dark) {
    //   metaThemeColor.setAttribute("content", "#212121");
    // } else {
    //   metaThemeColor.setAttribute("content", "#0277bd");
    // }
  }
}
</script>
