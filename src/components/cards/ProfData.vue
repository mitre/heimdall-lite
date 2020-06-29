<template>
  <v-card>
    <v-row class="pa-4" justify="space-between">
      <v-col class="d-flex text-center">
        <v-scroll-y-transition mode="out-in">
          <div
            v-if="!selected"
            class="title grey--text text--lighten-1 font-weight-light"
            style="align-self: center;"
          >
            Select a Profile
          </div>
          <v-card v-else :key="selected.id" class="mx-auto" flat>
            <v-card-title>
              <h3>
                {{ selected.name }}
              </h3>
              <div class="mb-2">{{ selected.data.title }}</div>
            </v-card-title>
            <v-divider></v-divider>
            <v-row class="text-left py-2" tag="v-card-text">
              <template v-for="info in selected_info">
                <v-col :key="info.label" tag="strong" md="4" sm="12">
                  {{ info.label }}:
                </v-col>
                <v-col :key="info.label + '_'" md="8" sm="12">
                  {{ info.text }}
                </v-col>
              </template>
            </v-row>
          </v-card>
        </v-scroll-y-transition>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import InspecDataModule, { isFromProfileFile } from "@/store/data_store";
import {
  SourcedContextualizedProfile,
  SourcedContextualizedEvaluation
} from "@/store/report_intake";
import StatusCountModule from "@/store/status_counts";
import { getModule } from "vuex-module-decorators";
import FilteredDataModule, { Filter } from "../../store/data_filters";
import { profile_unique_key } from "../../utilities/format_util";
import { InspecFile, ProfileFile } from "../../store/report_intake";
import { context } from "inspecjs";

/**
 * Makes a ContextualizedProfile work as a TreeView item
 * Note: We cannot just put our ContextualizedProfile in here because,
 * for reasons unknown, it will cause a horrendous recursion loop
 */
class TreeItem {
  /** The item's unique identifier */
  id: string;
  /** What to show on the treeview */
  name: string;
  /** The children on the treeview */
  children: TreeItem[];

  constructor(profile: context.ContextualizedProfile) {
    // Base information
    this.id = profile_unique_key(profile);
    this.name = profile.data.name;
    this.children = profile.extended_by.map(p => new TreeItem(p));
  }
}

// We declare the props separately
// to make props types inferrable.
const Props = Vue.extend({
  props: {
    filter: Object, // Of type Filer from filteredData
    selected_prof: String
  }
});

@Component({
  components: {}
})
export default class ProfileData extends Props {
  /** Models all loaded profiles */
  get items(): TreeItem[] {
    return this.root_profiles.map(p => new TreeItem(p));
  }

  /** Flat representation of all profiles that ought to be visible  */
  get visible_profiles(): Readonly<context.ContextualizedProfile[]> {
    let filtered = getModule(FilteredDataModule, this.$store);
    return filtered.profiles(this.filter.fromFile);
  }

  /** Strips visible profiles down to those that are not extended from any others. The "Top" profiles */
  get root_profiles(): context.ContextualizedProfile[] {
    // Strip to roots
    let profiles = this.visible_profiles.filter(
      p => p.extends_from.length === 0
    );
    return profiles;
  }

  /** Get the most recently selected */
  get selected(): context.ContextualizedProfile | undefined {
    const id = this.selected_prof;
    const selected_profile = this.visible_profiles.find(
      prof => profile_unique_key(prof) === id
    );
    return selected_profile;
  }

  /** Produces the actual info data that is shown in the right box, based on the selected item */
  get selected_info(): InfoItem[] {
    if (this.selected === undefined) {
      return [];
    }
    let output: InfoItem[] = [];

    output.push({
      label: "Version",
      text: (this.selected.data as any).version //Todo: fix
    });

    // Deduce filename, start time
    let from_file: InspecFile;
    let start_time: string | null;
    if (isFromProfileFile(this.selected)) {
      from_file = this.selected.from_file as ProfileFile;
      start_time = null;
    } else {
      let exec = (this.selected
        .sourced_from as unknown) as SourcedContextualizedEvaluation;
      from_file = exec.from_file;
      let with_time = this.selected.contains.find(x => x.root.hdf.start_time);
      start_time = (with_time && with_time.root.hdf.start_time) || null;
    }

    // And put the filename
    output.push({
      label: "From file",
      text: from_file.filename
    });

    if (start_time) {
      output.push({
        label: "Start time",
        text: start_time
      });
    }

    if (this.selected.data.sha256) {
      output.push({
        label: "Sha256 Hash",
        text: this.selected.data.sha256
      });
    }

    if (this.selected.data.title) {
      output.push({
        label: "Title",
        text: this.selected.data.title
      });
    }

    if (this.selected.data.maintainer) {
      output.push({
        label: "Maintainer",
        text: this.selected.data.maintainer
      });
    }

    if (this.selected.data.copyright) {
      output.push({
        label: "Copyright",
        text: this.selected.data.copyright
      });
    }

    if (this.selected.data.copyright_email) {
      output.push({
        label: "Copyright Email",
        text: this.selected.data.copyright_email
      });
    }

    output.push({
      label: "Controls",
      text: this.selected.data.controls.length.toString()
    });

    return output;
  }
}

interface InfoItem {
  label: string;
  text: string;
  info?: string;
}
</script>
