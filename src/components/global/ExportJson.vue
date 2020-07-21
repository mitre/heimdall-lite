<template>
  <v-tooltip top>
    <template v-slot:activator="{on}">
      <LinkItem
        key="export_json"
        text="Export as JSON"
        icon="mdi-code-json"
        @click="export_json()"
        v-on="on"
      />
    </template>
    <span>JSON Download</span>
  </v-tooltip>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {saveAs} from 'file-saver';
import LinkItem, {
  LinkAction
} from '@/components/global/sidebaritems/SidebarLink.vue';
import {EvaluationFile, ProfileFile} from '@/store/report_intake';
import {getModule} from 'vuex-module-decorators';
import InspecDataModule, {isFromProfileFile} from '../../store/data_store';
import FilteredDataModule from '../../store/data_filters';
import {ZipFile} from 'yazl';
import concat from 'concat-stream';

// We declare the props separately
// to make props types inferrable.
const Props = Vue.extend({
  props: {}
});

@Component({
  components: {
    LinkItem
  }
})
export default class ExportJSON extends Props {
  //exports .zip of jsons if multiple are selected, if one is selected it will export that .json file
  export_json() {
    let filter_mod = getModule(FilteredDataModule, this.$store);
    let ids = filter_mod.selected_file_ids;
    if (ids.length < 1) {
      return;
    } else if (ids.length === 1) {
      //will only ever loop once
      for (let evaluation of filter_mod.evaluations(ids)) {
        let blob = new Blob([JSON.stringify(evaluation.data)], {
          type: 'application/json'
        });
        saveAs(blob, evaluation.from_file.filename);
      }
      for (let prof of filter_mod.profiles(ids)) {
        if (isFromProfileFile(prof)) {
          let blob = new Blob([JSON.stringify(prof.data)], {
            type: 'application/json'
          });
          saveAs(blob, prof.from_file.filename);
        }
      }
    } else {
      let zipfile = new ZipFile();
      for (let evaluation of filter_mod.evaluations(ids)) {
        let buffer = Buffer.from(JSON.stringify(evaluation.data));
        zipfile.addBuffer(
          buffer,
          this.cleanup_filename(evaluation.from_file.filename)
        );
      }
      for (let prof of filter_mod.profiles(ids)) {
        if (isFromProfileFile(prof)) {
          let buffer = Buffer.from(JSON.stringify(prof.data));
          zipfile.addBuffer(
            buffer,
            this.cleanup_filename(prof.from_file.filename)
          );
        }
      }
      //let zipfile.addBuffer(Buffer.from("hello"), "hello.txt");
      // call end() after all the files have been added
      zipfile.outputStream.pipe(
        concat({encoding: 'uint8array'}, (b: Uint8Array) => {
          saveAs(new Blob([b]), 'exported_jsons.zip');
        })
      );
      zipfile.end();
    }
  }
  cleanup_filename(filename: string): string {
    filename = filename.replace(/\s+/g, '_');
    if (filename.substring(filename.length - 6) != '.json') {
      filename = filename + '.json';
    }
    return filename;
  }
}
</script>
