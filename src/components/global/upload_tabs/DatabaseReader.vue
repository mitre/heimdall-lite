<template>
  <v-card>
    <v-card-subtitle
      >Easily load any supported Heimdall Data Format file</v-card-subtitle
    >
    <v-container>
      <v-list>
        <v-list-item
          v-for="(evaluation, index) in personal_evaluations"
          :key="index"
        >
          <v-list-item-content>
            <v-list-item-title v-text="evaluation.version" />
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon @click="load_this_evaluation(evaluation)">
              <v-icon>mdi-plus-circle</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import ServerModule from "@/store/server";
import AppInfoModule from "@/store/app_info";
import { plainToClass } from "class-transformer";

export class Evaluation {
  id!: number;
  version!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

// We declare the props separately to make props types inferable.
const Props = Vue.extend({
  props: {}
});
/**
 * File reader component for taking in inspec JSON data.
 * Uploads data to the store with unique IDs asynchronously as soon as data is entered.
 * Emits "got-files" with a list of the unique_ids of the loaded files.
 */
@Component({
  components: {}
})
export default class DatabaseReader extends Props {
  get personal_evaluations(): Evaluation[] {
    let mod = getModule(ServerModule, this.$store);
    if (mod.user_evaluations) {
      let eval_obj = Array.from(mod.user_evaluations) || [];
      const evals: Evaluation[] = eval_obj.map((x: any) =>
        plainToClass(Evaluation, x)
      );
      console.log("evals: " + evals.length);
      return evals;
    } else {
      return [new Evaluation()];
    }
  }

  load_this_evaluation(evaluation: Evaluation) {
    console.log("load this file: " + evaluation.id);
  }
}
</script>
