<template>
  <v-row no-gutters>
    <!-- Expand/collapse button -->
    <v-col cols="1" align-cener="center">
      <v-btn @click="$emit('toggle', !expanded)" icon>
        <v-icon>{{ expanded ? "expand_more" : "expand_less" }}</v-icon>
      </v-btn>
    </v-col>

    <!-- Status and Severity -->
    <v-col cols="4">
      <DoubleCollapseCol :proportion="6">
        <template #left>
          <v-card
            class="pa-0"
            outlined
            tile
            :color="getStatusColor(control.status)"
          >
            <v-card-text class="center">
              {{ control.status }}
            </v-card-text>
          </v-card>
        </template>
        <template #right>
          <v-card class="pa-0" outlined tile>
            <v-card-text class="center">
              <v-icon
                v-for="i in severityArrowCount(control.severity)"
                :key="i"
                class="stack-icon"
                >chevron_right</v-icon
              >
              {{ control.severity }}
            </v-card-text>
          </v-card>
        </template>
      </DoubleCollapseCol>
    </v-col>

    <!-- Title Column -->
    <v-col cols="4" class="text-start">
      <v-card class="pa-0 text-truncate" outlined tile>
        <v-card-text>{{ control.wraps.title }}</v-card-text>
      </v-card>
    </v-col>

    <!-- ID and Tags -->
    <v-col cols="3">
      <DoubleCollapseCol :proportion="4">
        <template #left>
          <v-card class="pa-0" outlined tile>
            <v-card-text>{{ control.wraps.id }}</v-card-text>
          </v-card>
        </template>
        <template #right>
          <v-card class="pa-0" outlined tile>
            <v-card-text>{{ fmtNist(control.nist_tags) }}</v-card-text>
          </v-card>
        </template>
      </DoubleCollapseCol>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { HDFControl, ControlStatus, Severity } from "inspecjs";
import DoubleCollapseCol from "@/components/generic/DoubleCollapseCol.vue";

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
  components: {
    DoubleCollapseCol
  }
})
export default class ControlRowHeader extends ControlRowHeaderProps {
  getStatusColor(status: ControlStatus): string {
    // maps stuff like "not applicable" -> "statusnotapplicable", which is a defined color name
    return `status${status.replace(" ", "")}`;
  }

  severityArrowCount(severity: Severity): number {
    switch (severity) {
      default:
      case "none":
        return 0;
      case "low":
        return 1;
      case "medium":
        return 2;
      case "high":
        return 3;
      case "critical":
        return 4;
    }
  }

  fmtNist(nist: string[]): string {
    return nist.join(", ");
  }
}
</script>

<style scoped>
.center {
  text-align: justify;
}

.stack-icon {
  margin-left: -16px;
  margin-top: -8px;
  margin-bottom: -8px;
}
</style>
