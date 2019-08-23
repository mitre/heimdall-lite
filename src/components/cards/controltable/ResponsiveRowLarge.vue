<template>
  <v-row no-gutters>
    <v-col class="pa-0" :cols="2">
      <v-card outlined tile class="fill-height">
        <slot name="status" />
      </v-card>
    </v-col>

    <v-col class="pa-0" :cols="2">
      <v-card outlined tile class="fill-height">
        <slot name="severity" />
      </v-card>
    </v-col>

    <v-col class="pa-0" :cols="5">
      <v-card outlined tile class="fill-height">
        <slot name="title" />
      </v-card>
    </v-col>

    <v-col class="pa-0" :cols="2">
      <v-card outlined tile class="fill-height">
        <slot name="id" />
      </v-card>
    </v-col>

    <v-col class="pa-0" :cols="1">
      <v-card outlined tile class="fill-height">
        <slot name="tags" />
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

const Props = Vue.extend({
  props: {
    statusColor: String
  }
});
@Component
export default class Row extends Props {}
</script>
