<template>
  <!-- Need to catch for ResponsiveRowSwitch @toggle events for small view -->
  <ResponsiveRowSwitch>
    <template #status>
      <v-btn
        :color="status_color"
        block
        class="pl-2 button title"
        hover
        @click="$emit('toggle', !expanded)"
      >
        <v-icon left>{{
          expanded ? "mdi-chevron-down" : "mdi-chevron-up"
        }}</v-icon>
        {{ control.root.hdf.status }}
      </v-btn>
    </template>

    <template #severity>
      <v-card-text class="pa-2">
        <v-icon small v-for="i in severity_arrow_count" :key="'sev0' + i"
          >mdi-checkbox-blank-circle</v-icon
        >
        <v-icon small v-for="i in 4 - severity_arrow_count" :key="'sev1' + i"
          >mdi-checkbox-blank-circle-outline</v-icon
        >
        <br />
        <v-divider class="lighten-4 mx-1"></v-divider>
        {{ control.hdf.severity.toUpperCase() }}
      </v-card-text>
    </template>

    <template #title>
      <v-clamp class="pa-2 title" autoresize :max-lines="4">
        <template slot="default">{{ control.data.title }}</template>
        <template slot="after" slot-scope="{ toggle, expanded, clamped }">
          <v-icon fab v-if="!expanded && clamped" right medium @click="toggle"
            >mdi-plus-box</v-icon
          >
          <v-icon fab v-if="expanded" right medium @click="toggle"
            >mdi-minus-box</v-icon
          >
        </template>
      </v-clamp>
    </template>

    <!-- ID and Tags -->
    <template #id>
      <v-card-text class="pa-2 title font-weight-bold">{{
        control.data.id
      }}</v-card-text>
    </template>
    <template #tags>
      <v-chip-group column active-class="NONE">
        <v-tooltip
          bottom
          v-for="(tag, i) in filteredNistTags"
          :key="'chip' + i"
        >
          <template v-slot:activator="{ on }">
            <v-chip v-on="on" active-class="NONE">{{ tag }}</v-chip>
          </template>
          <span>{{ tooltip(tag) }}</span>
        </v-tooltip>
        <v-tooltip
          bottom
          v-for="(cci, i) in control.hdf.wraps.tags.cci"
          :key="'tooltip' + i"
        >
          <template v-slot:activator="{ on }">
            <v-chip v-on="on" active-class="NONE">{{ cci }}</v-chip>
          </template>
          <span>{{ tooltip(cci) }}</span>
        </v-tooltip>
      </v-chip-group>
    </template>
  </ResponsiveRowSwitch>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { HDFControl, ControlStatus, Severity } from "inspecjs";
import ResponsiveRowSwitch from "@/components/cards/controltable/ResponsiveRowSwitch.vue";
import { ContextualizedControl } from "../../../store/data_store";
import { NIST_DESCRIPTIONS } from "@/utilities/nist_util";
//@ts-ignore
import VClamp from "vue-clamp/dist/vue-clamp.js";

// We declare the props separately to make props types inferable.
const ControlRowHeaderProps = Vue.extend({
  props: {
    control: {
      type: Object, // Of type HDFControl (but with added key field)
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
    ResponsiveRowSwitch,
    VClamp
  }
})
export default class ControlRowHeader extends ControlRowHeaderProps {
  /** Typed getter for control */
  get _control(): ContextualizedControl {
    return this.control;
  }

  // Get NIST tag description for NIST tag, this is pulled from the 800-53 xml
  // and relies on a script not contained in the project
  get tooltip(): (tag: string) => string {
    return (tag: string) => {
      return this.descriptionForTag(tag);
    };
  }

  get status_color(): string {
    // maps stuff like "not applicable" -> "statusnotapplicable", which is a defined color name
    return `status${this._control.root.hdf.status.replace(" ", "")}`;
  }

  get severity_arrow_count(): number {
    switch (this._control.hdf.severity) {
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

  get filteredNistTags(): string[] {
    {
      let ignored = /Rev_\d/;
      return this._control.hdf.raw_nist_tags.filter(
        item => !item.search(ignored)
      );
    }
  }

  fmtNist(nist: string[]): string {
    return nist.join(", ");
  }

  // Get NIST tag description for NIST tag, this is pulled from the 800-53 xml
  // and relies on a script not contained in the project
  descriptionForTag(tag: string): string {
    return NIST_DESCRIPTIONS[tag] || "Unrecognized tag";
  }
}
</script>

<style scoped>
.lightened-row .v-card {
  background: var(--v-background-lighten-2);
}
</style>
