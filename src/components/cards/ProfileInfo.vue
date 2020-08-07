<template>
  <v-card>
    <v-row class="pa-4" justify="space-between">
      <v-col cols="12">
        <b>Name:</b> {{ name }}<br />
        <b>Title:</b> {{ title }}<br />
        <b>Maintainer:</b> {{ maintainer }}<br />
        <b>Copyright:</b> {{ copyright }}<br />
        <b>Copyright Email:</b> {{ copyright_email }}<br />
        <b>Summary:</b> {{ summary }}<br />
        <b>Supports:</b>
        <ul v-for="item in supports" v-bind:key="item.name">
          <li>
            <b>{{ item.name }}:</b> {{ item.value }}
          </li>
        </ul>
        <br />
        <b>Version:</b> {{ version }}<br />
        <b>SHA256:</b> {{ sha256 }}<br />
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import InspecDataModule from '@/store/data_store';
import {getModule} from 'vuex-module-decorators';
import ServerModule from '@/store/server';
import FilteredDataModule, {Filter} from '../../store/data_filters';
import {InspecFile, ProfileFile} from '../../store/report_intake';
import {context} from 'inspecjs';
import {Content} from '@/types/models.ts';

// We declare the props separately
// to make props types inferrable.
const ProfileInfoProps = Vue.extend({
  props: {
    filter: Number // Of type Filer from filteredData
  }
});

@Component({
  components: {}
})
export default class ProfileInfo extends ProfileInfoProps {
  name: string | null = null;
  title: string | null | undefined = null;
  maintainer: string | null | undefined = null;
  copyright: string | null | undefined = null;
  copyright_email: string | null | undefined = null;
  summary: string | null | undefined = null;
  sha256: string | null | undefined = null;
  version: string | null | undefined = null;
  supports: Content[] | null = null;
  database_id: number | null = null;

  created() {
    this.load_file();
  }

  load_file() {
    let store = getModule(InspecDataModule, this.$store);
    let file = store.allFiles.find(f => f.unique_id === this.filter);
    if (file) {
      let prof = file as ProfileFile;
      this.name = prof.profile.name;
      this.title = prof.profile.title;
      this.maintainer = prof.profile.maintainer;
      this.copyright = prof.profile.copyright;
      this.copyright_email = prof.profile.copyright_email;
      this.supports = [];
      let eval_obj = Array.from(prof.profile.supports) || [];
      for (let data of eval_obj) {
        let obj = JSON.parse(JSON.stringify(data));
        for (let key in data) {
          let value = obj[key];
          if (value) {
            let new_sup: Content = {
              name: key,
              value: value
            };
            if (new_sup) {
              this.supports.push(new_sup);
            }
          }
        }
      }
      this.sha256 = prof.profile.sha256;
      this.version = prof.profile.version;
      this.database_id = prof.database_id || null;
    }
  }
}
</script>
