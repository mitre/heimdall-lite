<template>
  <div class="fill-height" style="text-align: center">
    <span :class="classes"> {{ text }} </span>
    <v-btn v-if="allow_sort" icon @click="toggle_sort">
      <v-icon class="pa-0"> {{ icon }} </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

export type Sort = "ascending" | "descending" | "none" | "disabled";

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {
    text: {
      type: String,
      required: true
    },
    sort: {
      type: String, // Of type Sort
      required: true
    }
  }
});

@Component
export default class ColumnHeader extends Props {
  get allow_sort(): boolean {
    return this.sort !== "disabled";
  }

  get classes(): string[] {
    let ret = ["text-start", "justify-center"];
    if (this.allow_sort) {
      ret.push("sortable");
      if ((this.sort as Sort) === "ascending") {
        ret.push("active", "asc");
      } else if ((this.sort as Sort) === "descending") {
        ret.push("active", "desc");
      }
    }
    return ret;
  }

  toggle_sort(): void {
    let new_sort: string;
    switch (this.sort as Sort) {
      default: // Shouldn't happen but whatever
      case "none":
        new_sort = "descending";
        break;
      case "descending":
        new_sort = "ascending";
        break;
      case "ascending":
        new_sort = "none";
        break;
    }
    this.$emit("input", new_sort);
  }

  get icon(): string {
    switch (this.sort as Sort) {
      default:
      case "none":
        return "sort";
      case "ascending":
        return "arrow_upward";
      case "descending":
        return "arrow_downward";
    }
  }
}
</script>
