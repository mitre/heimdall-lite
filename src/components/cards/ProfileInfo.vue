<template>
  <v-card>
    <v-row class="pa-4" justify="space-between">
      <v-col cols="12">
        <b>Name:</b> {{ profile.profile.name }}<br />
        <b>Title:</b> {{ profile.profile.title }}<br />
        <b>Maintainer:</b> {{ profile.profile.maintainer }}<br />
        <b>Copyright:</b> {{ profile.profile.copyright }}<br />
        <b>Copyright Email:</b> {{ profile.profile.copyright_email }}<br />
        <b>Summary:</b> {{ profile.profile.summary }}<br />
        <b>Supports:</b>
        <ul v-for="item in supports" v-bind:key="item.name">
          <li>
            <b>{{ item.name }}:</b> {{ item.value }}
          </li>
        </ul>
        <br />
        <b>Version:</b> {{ profile.profile.version }}<br />
        <b>SHA256:</b> {{ profile.profile.sha256 }}<br />
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Content} from '@/types/models.ts';

// We declare the props separately
// to make props types inferrable.
const ProfileInfoProps = Vue.extend({
  props: {
    profile: Object // Of type ProfileFile
  }
});

@Component({
  components: {}
})
export default class ProfileInfo extends ProfileInfoProps {
  supports: Content[] | null = null;

  created() {
    this.fill_supports();
  }

  fill_supports() {
    this.supports = [];
    let eval_obj = Array.from(this.profile.profile.supports) || [];
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
</script>
