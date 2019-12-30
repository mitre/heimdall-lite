<template>
  <v-container>
    <v-row>
      <v-col center xl="8" md="8" sm="12" xs="12">
        <UploadNexus
          :value="dialog"
          @got-files="on_got_files"
          :persistent="true"
          :blecho="fetcho"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import UploadNexus from "@/components/global/UploadNexus.vue";
import { Filter } from "@/store/data_filters";
import S3 from "aws-sdk/clients/s3";
import { FileID } from "@/store/report_intake";
import {
  list_buckets,
  get_session_token,
  AuthCreds
} from "@/utilities/aws_util";

// We declare the props separately
// to make props types inferrable.
const LandingProps = Vue.extend({
  props: {}
});

const cors_api_url = "http://localhost:8090/";
function doCORSFetch(url: string) {
  // fetch(cors_api_url + url).then(async resp => {
  fetch(cors_api_url + url).then(async resp => {
    let text = await resp.text();
    console.log(`GET ${url}\n ${resp.status} ${resp.statusText}\n\n ${text}`);
  });
}

@Component({
  components: {
    UploadNexus
  }
})
export default class Landing extends LandingProps {
  /** Whether or not the model is showing */
  dialog: boolean = true;

  get fetcho(): string {
    // doCORSFetch("https://dummy.restapiexample.com/api/v1/employees");
    this.list_file_test()
      .then(result => {
        console.log("Got files:");
        console.log(result);
      })
      .then(() => this.list_buckets_test())
      .then(result => {
        console.log("Got buckets:");
        console.log(result);
      })
      .catch(err => console.error(err));
    return "hey";
  }

  async make_creds(): Promise<AuthCreds> {
    return get_session_token(
      "AKIARBM55D5P2E6ANEFV",
      "jvO10OxCuNZhUzBOVYLvd9Edvh01+WtpI3vGKd2C"
    ).then(x => x.creds);
  }

  async make_s3(bucket_name: string | null): Promise<S3> {
    let endpoint = `${cors_api_url}https://s3.amazonaws.com`;
    if (bucket_name) {
      endpoint = `${cors_api_url}https://${bucket_name}.s3.amazonaws.com`;
    }
    return this.make_creds().then(creds => {
      let result = new S3({
        ...creds,
        // let S3_AWS_PROXY = new AWS.Endpoint(`http://${location.hostname}:8090/https://s3.us-east-1.amazonaws.com`);
        // endpoint: cors_api_url + "https://s3.amazonaws.com"
        endpoint,
        s3BucketEndpoint: bucket_name !== null
        //httpOptions: {
        //proxy: "localhost:8090"
        // },
      });
      console.log(result.endpoint);
      return result;
    });
  }

  async list_file_test(): Promise<S3.Object[]> {
    let bucket_name = "heimdall-demo-bucket";
    return this.make_s3(bucket_name)
      .then(s3 =>
        s3
          .listObjectsV2({
            Bucket: bucket_name,
            MaxKeys: 100
          })
          .promise()
      )
      .then(success => {
        return success.Contents || [];
      })
      .catch((failure: any) => {
        console.log(failure);
        return [];
      });
  }

  async list_buckets_test(): Promise<S3.Bucket[]> {
    return this.make_s3(null)
      .then(s3 => s3.listBuckets().promise())
      .then(success => {
        return success.Buckets || [];
      })
      .catch((failure: any) => {
        console.log(failure);
        return [];
      });
  }

  /**
   * Invoked when file(s) are loaded.
   */
  on_got_files(ids: FileID[]) {
    // Close the dialog
    this.dialog = false;

    // If just one file, focus it
    if (ids.length === 1) {
      this.$router.push(`/results/${ids[0]}`);
    }

    // If more than one, focus all.
    // TODO: Provide support for focusing a subset of files
    else if (ids.length > 1) {
      this.$router.push(`/results/all`);
    }
  }
}
</script>
