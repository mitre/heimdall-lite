<template>
  <div>
    <v-content>
      <ResultsView />
    </v-content>


    <!-- File select modal toggle -->
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

    <!-- File select modal -->
    <Modal :dialog="dialog" @modal-dismissed="dialog = false">
      <template>
        <v-card>
          <v-card-title class="grey darken-2">Load files</v-card-title>
          <FileReader v-on:got-file="on_got_file" />
        </v-card>
      </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ResultsView from "@/components/ResultsView.vue";

export default Vue.extend({
  components: {
    ResultsView
  }
});
</script>
