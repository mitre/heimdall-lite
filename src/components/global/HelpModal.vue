<template>
  <div class="text-center">
    <v-dialog v-model="dialog" width="500">
      <template v-slot:activator="{ on }">
        <v-btn dark v-on="on">
          Help
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="headline grey" primary-title>
          How to use Heimdall-Vuetify
        </v-card-title>

        <v-card-text>
          <br />
          - Upload Json file using the green "+" button on the bottom
          right.L0<br />
          - Filter results by clicking on the corresponding results in the donut
          chart.<br />
          - Use the treemap or datatable to navigate controls.<br />
          - Select a control to see its details and code.
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="dialog = false">
            Close Window
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialog: false
    };
  }
};
</script>
