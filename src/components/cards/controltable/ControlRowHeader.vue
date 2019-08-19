<template>
  <tr>
    <!-- Expand button -->
    <td class="text-start">
      <v-btn @click="$emit('toggle', !expanded)">
        <v-icon>{{ expanded ? "expand_more" : "expand_less" }}</v-icon>
      </v-btn>
    </td>

    <!-- Status column -->
    <td class="text-start">
      <v-chip :color="getColor(control.status)" :label="true" class="wset">
        {{ control.status }}
      </v-chip>
    </td>

    <!-- Title Column -->
    <td class="text-start">
      {{ control.wraps.title }}
    </td>

    <!-- ID Column -->
    <td class="text-start">
      {{ control.wraps.id }}
    </td>

    <!-- Severity Column -->
    <td class="text-start">
      {{ control.severity }}
    </td>

    <!-- Nist tags column -->
    <td class="text-start">
      {{ fmtNist(control.nist_tags) }}
    </td>
  </tr>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { HDFControl, ControlStatus } from "inspecjs";

// We declare the props separately to make props types inferable.
const ControlRowHeaderProps = Vue.extend({
  props: {
    control: {
      type: Object, // Of type HDFControl
      required: true
    },
    expanded: {
      type: Boolean, // Whether or this control should be open
      required: false
    }
  }
});

@Component({
  components: {}
})
export default class ControlRowHeader extends ControlRowHeaderProps {
  getColor(def: ControlStatus): string {
    // Maps stuff like "Not Applicable" -> "statusNotApplicable", which is a defined color name
    return `status${def.replace(" ", "")}`;
  }

  fmtNist(nist: string[]): string {
    return nist.join(", ");
  }
}
</script>

<style scoped>
.wset {
  min-width: 125px;
  justify-content: center;
}
</style>
