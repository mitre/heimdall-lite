<template>
  <v-sheet>
    <v-toolbar dense ma-4 pa-4>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-switch
          label="Toggle dark them"
          v-model="goDark"
          v-on:change="updateDark"
        ></v-switch>
      </v-toolbar-items>

      <template v-if="$vuetify.breakpoint.smAndUp">
        <v-btn icon>
          <v-icon>mdi-export-variant</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-delete-circle</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-plus-circle</v-icon>
        </v-btn>
      </template>
    </v-toolbar>
  </v-sheet>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

// We declare the props separately to make props types inferable.
const ToolbarProps = Vue.extend({
  props: {}
});

@Component({
  components: {}
})
export default class Toolbar extends ToolbarProps {
  goDark: boolean = false;
  updateDark() {
    this.$vuetify.theme.dark = this.goDark;
  }
}
</script>
