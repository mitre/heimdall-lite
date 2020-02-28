<template>
  <v-card>
    <v-card-subtitle
      >Easily load any supported Heimdall Data Format file</v-card-subtitle
    >
    <v-container>
      <v-row>
        <v-col cols="12" align="center">
          <!-- Use inline style to emulate v-img props -->
          <img
            src="@/assets/logo-orange-tsp.svg"
            svg-inline
            style="max-width: 164px; max-height: 164px;"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" align="center">
          <div class="d-flex flex-column justify-center">
            <span :class="title_class">Heimdall</span>
            <span :class="title_class">Lite</span>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-spacer />
        <v-col align="center" cols="4">
          <UploadButton @files-selected="commit_files" />
        </v-col>
        <v-col align="right" cols="4">
          <a
            href="https://mitre.github.io/heimdall-lite-1.0/"
            target="_blank"
            class="mr-2"
          >
            Looking for 1.0?
          </a>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import UploadButton from "@/components/global/UploadButton.vue";
import XCCDF from "@/utilities/xccdf";
import InspecIntakeModule, {
  FileID,
  next_free_file_ID
} from "@/store/report_intake";
import AppInfoModule from "@/store/app_info";
import {
  read_file_async,
  read_zip_async,
  zip_handle_each,
  FileContents
} from "@/utilities/async_util";

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
  components: {
    UploadButton
  }
})
export default class FileReader extends Props {
  /** Callback for our file reader */
  commit_files(files: File[]) {
    let valid_ids: FileID[] = []; // Use this to track those that get successfully uploaded

    // Promise an upload of each
    let upload_promises = files.map(this.multiplex_file);

    // Fetch fileids of the successes, catch errors. We must catch errors to use Promise.all
    let successmark_promises = upload_promises.map(p => {
      return p
        .then(file_ids => {
          valid_ids.push(...file_ids);
        })
        .catch(err => {
          console.warn(err);
        });
    });

    // When they're all done, emit event.
    Promise.all(successmark_promises).then(_ =>
      this.$emit("got-files", valid_ids)
    );
  }

  /** Decides what to do with a file based on its filename */
  async multiplex_file(file: File | FileContents): Promise<FileID[]> {
    let extension = get_extension(file.name);

    // If file, we want to generally just decode, but in case of a zip we want to parse directly
    if (is_file(file)) {
      if (extension === ".zip") {
        return this.handle_zip(file);
      } else {
        // Want to turn it to string, then that string to contents
        return read_file_async(file, false)
          .then(text => {
            return {
              name: file.name,
              text: text as string
            } as FileContents;
          })
          .then(this.multiplex_file);
      }
    } else {
      // It's already been parsed into contents
      if (extension === ".json") {
        return this.handle_json_content(file);
      } else if (extension === ".xml") {
        console.log("found " + extension);
        return this.handle_xml_content(file);
      } else if (extension === ".zip") {
        console.error(
          `Something went wrong ${file.name} being parsed as text. Perhaps a nested zip occurred?`
        );
        return [];
      } else {
        console.log(new Error("Unhandled filetype found: " + extension));
      }
    }
  }

  // Uploads a zip file. Spits out contents then delegates to handle_json and handle_xml
  async handle_zip(zip: File): Promise<FileID[]> {
    return read_zip_async(zip)
      .then(zip_handle_each)
      .then(files => {
        // Handle each file properly
        return Promise.all(files.map(this.multiplex_file)).then(lol => {
          let results: FileID[] = [];
          for (let l of lol) {
            results.push(...l);
          }
          return results;
        });
      });
  }

  /** note to luke: After parsing the xml into json, probably repack into a new FileContents and
   * deligate it on to handle_json_contents.
   *
   * This is just my best guess at how best to do it since I don't know exactly how your json code works.
   */
  async handle_xml_content(xml_content: FileContents): Promise<FileID[]> {
    let xccdf: XCCDF = new XCCDF(xml_content.text);
    console.log(xccdf);
    return [];
    // return [];
  }

  /** Parses a JSON file and uploads it to the Data Store. */
  async handle_json_content(json: FileContents): Promise<FileID[]> {
    // Generate file id
    let unique_id = next_free_file_ID();

    // Submit it to be loaded, and display an error if it fails
    let intake_module = getModule(InspecIntakeModule, this.$store);
    return intake_module.loadText({ ...json, unique_id }).then(err => {
      if (err) {
        this.toast_file_error(json.name, err);
        return [];
      } else {
        // Store the given id as valid
        return [unique_id];
      }
    });
  }

  // Toasts that a file failed to load
  toast_file_error(filename: string, err: Error) {
    this.$toasted.global.error({
      message: String(err),
      isDark: this.$vuetify.theme.dark
    });
  }

  get title_class(): string[] {
    if (this.$vuetify.breakpoint.mdAndUp) {
      return ["display-4", "px-0"];
    } else {
      return ["display-2", "px-0"];
    }
  }

  get version(): string {
    return getModule(AppInfoModule, this.$store).version;
  }
}

/** Return the extension of a filename */
function get_extension(filename: string): string | null {
  let last_period = filename.lastIndexOf(".");
  if (last_period >= 0) {
    return filename.substring(last_period);
  }
  return null;
}

/** Distinguishes between files and file contents. Trivial but best broken out */
function is_file(f: File | FileContents): f is File {
  return typeof (f as any).text != "string";
}
</script>
