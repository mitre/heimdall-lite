<template>
  <v-card>
    <v-row class="pa-4" justify="space-between">
      <v-col cols="12">
        <b>Name:</b> {{ profile.profile.data.name }}<br />
        <b>Title:</b> {{ profile.profile.data.title }}<br />
        <b>Maintainer:</b> {{ profile.profile.data.maintainer }}<br />
        <b>Copyright:</b> {{ profile.profile.data.copyright }}<br />
        <b>Copyright Email:</b> {{ profile.profile.data.copyright_email }}<br />
        <b>Summary:</b> {{ profile.profile.data.summary }}<br />
        <b>Supports:</b>
        <ul v-for="item in supports" v-bind:key="item.name">
          <li>
            <b>{{ item.name }}:</b> {{ item.value }}
          </li>
        </ul>
        <br />
        <b>Version:</b> {{ profile.profile.data.version }}<br />
        <b>SHA256:</b> {{ profile.profile.data.sha256 }}<br />
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Content} from '@/types/models.ts';
import {FileID} from '@/store/report_intake';
import {ProfileFile} from '@/store/report_intake';
import {getModule} from 'vuex-module-decorators';
import InspecDataModule from '@/store/data_store';

// We declare the props separately
// to make props types inferrable.
const ProfileInfoProps = Vue.extend({
  props: {
    file_filter: Number // FileID of ProfileFile
  }
});

@Component({
  components: {}
})
export default class ProfileInfo extends ProfileInfoProps {
  profile: ProfileFile | null = null;
  supports: Content[] | null = null;

  created() {
    this.load_file();
  }

  load_file() {
    console.log('load_file: ' + this.file_filter);
    let store = getModule(InspecDataModule, this.$store);
    let file = store.allFiles.find(f => f.unique_id === this.file_filter);
    if (file) {
      this.profile = file as ProfileFile;
      this.fill_supports();
    }
  }

  fill_supports() {
    this.supports = [];
    if (this.profile) {
      let eval_obj = Array.from(this.profile.profile.data.supports) || [];
      for (let data of eval_obj) {
        let obj = JSON.parse(JSON.stringify(data));
        console.log('data: ' + JSON.stringify(data));
        for (let key in Object(data)) {
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
    }
  }
}
</script>
