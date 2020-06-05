<template>
  <v-card>
    <v-row class="pa-4" justify="space-between">
      <v-col cols="5">
        <b>ID: </b> {{ filter }}<br />
        <b>Filename:</b> {{ filename }}<br />
        <b>InSpec version:</b> {{ version }}<br />
        <b>Platform:</b> {{ platform_name }} {{ platform_release }}<br />
        <b>Duration:</b> {{ duration }}<br />
      </v-col>
      <v-divider vertical></v-divider>
      <v-col v-if="show_tags" class="text-center">
        <div v-if="tags" class="column_wrapper">
          <div v-for="item in tags.filter(not_filename)" :key="item.id">
            <b>{{ item.content.name }}:</b> {{ item.content.value }}
          </div>
        </div>
      </v-col>
      <v-col v-if="edit_tags" class="text-center">
        <div class="column_wrapper">
          <v-list v-if="tags" dense class="px-2" subheader>
            <v-subheader>Remove Tag</v-subheader>
            <div v-for="item in tags.filter(not_filename)" :key="item.id">
              <b>{{ item.content.name }}:</b> {{ item.content.value }}
              <v-btn icon small @click="remove_tag(item)">
                <v-icon> mdi-close </v-icon>
              </v-btn>
            </div>
          </v-list>
          <v-list dense class="px-2" subheader>
            <v-subheader>Add Tag</v-subheader>
            <v-form>
              <v-combobox
                :items="tag_list"
                v-model="tag_name"
                label="Tag Name"
                dense
              ></v-combobox>
              <v-text-field v-model="tag_value" label="Value" />
              <v-btn class="mr-4" @click="submit_tag">submit</v-btn>
            </v-form>
          </v-list>
        </div>
      </v-col>
      <v-btn v-if="show_tags" icon small @click="open_tag_edit">
        <v-icon class="float-right"> mdi-pencil-box-outline </v-icon>
      </v-btn>
      <v-btn v-if="edit_tags" icon small @click="close_tag_edit">
        <v-icon class="float-right"> mdi-close </v-icon>
      </v-btn>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import InspecDataModule from "@/store/data_store";
import { getModule } from "vuex-module-decorators";
import ServerModule from "@/store/server";
import FilteredDataModule, { Filter } from "../../store/data_filters";
import { InspecFile, EvaluationFile } from "../../store/report_intake";
import { context } from "inspecjs";
import { plainToClass } from "class-transformer";
import { LocalStorageVal } from "@/utilities/helper_util";

const local_evaluation_id = new LocalStorageVal<number | null>("evaluation_id");
const local_tags = new LocalStorageVal<string | null>("evaluation_tags");

export class Content {
  name!: string;
  value!: string;
}
export class Evaluation {
  id!: number;
  filename!: string;
  version!: string;
  createdAt!: Date;
  updatedAt!: Date;
  tags!: Tag[];
}
export class Tag {
  id!: number;
  tagger_id!: number;
  tagger_type!: string;
  content!: Content;
  createdAt!: Date;
  updatedAt!: Date;
}
export class Tags {
  tags!: Tag[];
}
export interface TagIdsHash {
  id: number;
  tagger_id: number;
}
export interface TagHash {
  tagger_id: number;
  name: string;
  value: string;
}

// We declare the props separately
// to make props types inferrable.
const EvaluationInfoProps = Vue.extend({
  props: {
    filter: Number // Of type Filer from filteredData
  }
});

@Component({
  components: {}
})
export default class EvaluationInfo extends EvaluationInfoProps {
  filename2: string | null = null;
  version: string | null = null;
  platform_name: string | null = null;
  platform_release: string | null = null;
  duration: number | null | undefined = null;
  tags: Tag[] | null = null;
  show_tags: boolean = true;
  edit_tags: boolean = false;
  tag_name: string | null = null;
  tag_value: string | null = null;

  created() {
    console.log("created");
    this.load_file();
  }

  updated() {
    console.log("updated");
    let store = getModule(InspecDataModule, this.$store);
    let file = store.allFiles.find(f => f.unique_id === this.filter);
    if (file) {
      let eva = file as EvaluationFile;
      this.version = eva.execution.version;
      console.log("updated this.version: " + this.version);
      this.platform_name = eva.execution.platform.name;
      this.platform_release = eva.execution.platform.release;
      this.duration = eva.execution.statistics.duration;
    }
  }

  mounted() {
    console.log("mounted");
  }

  watch() {
    console.log("Prop changed: " + this.filter);
    //this.filter; (newVal: string, oldVal: string): void => { // watch it
    //  console.log('Prop changed: ', newVal, ' | was: ', oldVal)
    //}
  }

  get filename() {
    let store = getModule(InspecDataModule, this.$store);
    let file = store.allFiles.find(f => f.unique_id === this.filter);
    if (file) {
      let eva = file as EvaluationFile;
      console.log("filename 1: " + eva.filename);
      let file_id: number | null = local_evaluation_id.get();
      if (file_id === null) {
        console.log("no file id");
      } else {
        this.load_tags(file_id);
      }
      return eva.filename;
    } else {
      return null;
    }
  }

  load_file() {
    console.log("load_file: " + this.filter);
    let store = getModule(InspecDataModule, this.$store);
    let file = store.allFiles.find(f => f.unique_id === this.filter);
    if (file) {
      let eva = file as EvaluationFile;
      console.log("filename 2: " + eva.filename);
      this.filename2 = eva.filename;
      this.version = eva.execution.version;
      this.platform_name = eva.execution.platform.name;
      this.platform_release = eva.execution.platform.release;
      this.duration = eva.execution.statistics.duration;
      let file_id: number | null = local_evaluation_id.get();
      if (file_id === null) {
        console.log("null file");
      } else {
        this.load_tags(file_id);
      }
    }
  }

  open_tag_edit() {
    this.show_tags = false;
    this.edit_tags = true;
  }

  close_tag_edit() {
    this.show_tags = true;
    this.edit_tags = false;
  }

  not_filename(tag: Tag) {
    return tag.content.name != "filename";
  }

  async submit_tag(): Promise<void> {
    console.log("submit " + this.tag_name + ": " + this.tag_value);
    const host = process.env.VUE_APP_API_URL!;

    // Get server module
    let file_id: number | null = local_evaluation_id.get();
    if (file_id && this.tag_name && this.tag_value) {
      let tag_hash: TagHash = {
        tagger_id: file_id,
        name: this.tag_name,
        value: this.tag_value
      };
      this.load_tags(file_id);
      let mod = getModule(ServerModule, this.$store);
      await mod
        .connect(host)
        .catch(bad => {
          console.error("Unable to connect to " + host);
        })
        .then(() => {
          return mod.save_tag(tag_hash);
        })
        .catch(bad => {
          console.error(`bad save ${bad}`);
        })
        .then(() => {
          console.log("here2");
          if (file_id === null) {
            console.log("null file");
          } else {
            this.load_tags(file_id);
          }
        });
    }
  }

  async remove_tag(tag: Tag): Promise<void> {
    console.log("remove " + JSON.stringify(tag));

    const host = process.env.VUE_APP_API_URL!;
    let tag_hash: TagIdsHash = {
      tagger_id: tag.tagger_id,
      id: tag.id
    };
    // Get server module
    let mod = getModule(ServerModule, this.$store);
    await mod
      .connect(host)
      .catch(bad => {
        console.error("Unable to connect to " + host);
      })
      .then(() => {
        console.log("delete tag:" + tag.id);
        return mod.delete_tag(tag_hash);
      })
      .catch(bad => {
        console.error(`bad delete ${bad}`);
      })
      .then(() => {
        console.log("here2");
        this.load_tags(tag.tagger_id);
      });
  }

  get tag_list(): String[] {
    return ["Hostname", "UUID", "FISMA System", "Environment"];
  }

  watches() {
    let mod = getModule(ServerModule, this.$store);
    console.log("watches " + JSON.stringify(mod.tags));
    if (mod.tags) {
      console.log("mod.tags = " + JSON.stringify(mod.tags));
      let tags_obj = Array.from(mod.tags) || [];
      const eva_tags: Tag[] = tags_obj.map((x: any) => plainToClass(Tag, x));
      console.log("tags: " + eva_tags.length);
      this.tags = eva_tags;
      return this.tags;
    } else {
      return null;
    }
  }

  update_tags() {
    console.log("update_tags");
    let mod = getModule(ServerModule, this.$store);
    if (mod.tags) {
      console.log("mod.tags = " + JSON.stringify(mod.tags));
      let tags_obj = Array.from(mod.tags) || [];
      const eva_tags: Tag[] = tags_obj.map((x: any) => plainToClass(Tag, x));
      console.log("tags: " + eva_tags.length);
      this.tags = eva_tags;
    }
  }

  async load_tags(file_id: number): Promise<void> {
    console.log("load_tags for " + file_id);
    const host = process.env.VUE_APP_API_URL!;

    // Get server module
    let mod = getModule(ServerModule, this.$store);
    //let eva = plainToClass(Evaluation, mod.evaluation);
    await mod
      .connect(host)
      .catch(bad => {
        console.error("Unable to connect to " + host);
      })
      .then(() => {
        console.log("here");
        return mod.retrieve_tags(file_id);
      })
      .catch(bad => {
        console.error(`bad retrieve ${bad}`);
      })
      .then(() => {
        console.log("here2");
        this.update_tags();
      });
  }
}
</script>
