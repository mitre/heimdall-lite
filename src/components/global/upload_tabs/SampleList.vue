<template>
  <v-card class="elevation-0">
    <v-card-subtitle>
      Samples to show the power of the Heimdall application and supported HDF
      formats
    </v-card-subtitle>
    <v-list max-height="434" style="overflow-y:scroll;">
      <v-list-item v-for="(sample, index) in samples" :key="index" class="mx-2">
        <v-list-item-content>
          <v-list-item-title v-text="sample.name" />
        </v-list-item-content>
        <v-list-item-action @click="select_samp(sample)">
          <v-checkbox color="blue" :input-value="selected(sample)" />
          <!--v-btn icon @click="load_sample(sample)">
            <v-icon>mdi-plus-circle</v-icon>
          </v-btn-->
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-btn block class="px-2" @click="load_selected_samps">
      Load
      <v-icon class="pl-2"> mdi-file-upload</v-icon>
    </v-btn>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import { defined } from "@/utilities/async_util";
import InspecIntakeModule, {
  FileID,
  next_free_file_ID
} from "@/store/report_intake";
import InspecDataModule from "../../../store/data_store";
import AppInfoModule from "../../../store/app_info";
import aws_s3_baseline from "../../../assets/samples/aws-s3-baseline.json";
import bad_nginx from "../../../assets/samples/bad_nginx.json";
import cis_aws_foundations_baseline from "../../../assets/samples/cis-aws-foundations-baseline.json";
import fortify_h_tools_conv_webgoat from "../../../assets/samples/fortify_h_tools_conv_webgoat.json";
import good_nginxresults from "../../../assets/samples/good_nginxresults.json";
import owasp_zap_webgoat from "../../../assets/samples/owasp_zap_webgoat.json";
import owasp_zap_zero from "../../../assets/samples/owasp_zap_zero.webappsecurity.json";
import rhel_cve_vulnerability_scan_baseline_with_failures from "../../../assets/samples/rhel_cve_vulnerability_scan_baseline_with_failures.json";
import rhel7_results from "../../../assets/samples/rhel7-results.json";
import sonarqube_java_sample from "../../../assets/samples/sonarqube_java_sample.json";
import ubuntu_1604_baseline_results from "../../../assets/samples/ubuntu-16.04-baseline-results.json";
import red_hat_bad from "../../../assets/samples/red_hat_bad.json";
import red_hat_good from "../../../assets/samples/red_hat_good.json";
import triple_overlay_profile from "../../../assets/samples/triple_overlay_profile_example.json";

interface Sample {
  name: string;
  sample: any;
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
export default class SampleList extends Props {
  selected_samps: Sample[] = [];

  get samples(): Sample[] {
    return [
      {
        name: "Sonarqube Java Heimdall_tools Sample",
        sample: sonarqube_java_sample
      },
      {
        name: "OWASP ZAP Webgoat Heimdall_tools Sample",
        sample: owasp_zap_webgoat
      },
      {
        name: "OWASP ZAP Zero_WebAppSecurity Heimdall_tools Sample",
        sample: owasp_zap_zero
      },
      {
        name: "Fortify Heimdall_tools Sample",
        sample: fortify_h_tools_conv_webgoat
      },
      {
        name: "AWS S3 Permissions Check",
        sample: aws_s3_baseline
      },
      {
        name: "AWS CIS Foundations Baseline",
        sample: cis_aws_foundations_baseline
      },
      {
        name: "NGINX Clean Sample",
        sample: good_nginxresults
      },
      {
        name: "NGINX With Failing Tests",
        sample: bad_nginx
      },
      {
        name: "Red Hat CVE Vulnerability Scan",
        sample: rhel_cve_vulnerability_scan_baseline_with_failures
      },
      {
        name: "RedHat 7 STIG Baseline",
        sample: rhel7_results
      },
      {
        name: "Ubuntu STIG Baseline",
        sample: ubuntu_1604_baseline_results
      },
      {
        name: "Red Hat With Failing Tests",
        sample: red_hat_bad
      },
      {
        name: "Red Hat Clean Sample",
        sample: red_hat_good
      },
      {
        name: "Triple Overlay Example",
        sample: triple_overlay_profile
      }
    ];
  }

  get repo(): string {
    let mod = getModule(AppInfoModule, this.$store);
    return `${mod.repo_org}/${mod.repo_name}`;
  }

  selected(samp: Sample): boolean {
    return this.selected_samps.includes(samp);
  }

  /** Callback for our list item clicks */
  load_sample(sample: Sample) {
    console.log(sample.sample);
    let intake_module = getModule(InspecIntakeModule, this.$store);
    let unique_id = next_free_file_ID();
    return intake_module
      .loadText({
        text: JSON.stringify(sample.sample),
        filename: sample.name,
        unique_id
      })
      .then(err => {
        if (err) {
          console.error(`Error loading sample ${sample.name}`);
          this.$toasted.global.error({
            message: String(err),
            isDark: this.$vuetify.theme.dark
          });
        } else {
          this.$emit("got-files", [unique_id]);
        }
      });
  }

  load_selected_samps() {
    for (let samp of this.selected_samps) {
      this.load_sample(samp);
    }
    this.selected_samps = [];
  }

  select_samp(samp: Sample) {
    for (let i = 0; i < this.selected_samps.length; i++) {
      if (this.selected_samps[i] === samp) {
        this.selected_samps.splice(i);
        return;
      }
    }
    this.selected_samps.push(samp);
  }
}
</script>
