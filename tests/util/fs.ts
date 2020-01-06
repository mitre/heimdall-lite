import * as fs from "fs";
import { FileContents } from "@/utilities/async_util";

/** Returns sorted list of files in a directory */
export function list_files(dir_path: string) {
  // Init result array
  let result = fs.readdirSync(dir_path);

  // Sort by filename
  return result.sort();
}

export function read_files(dir_name: string): FileContents[] {
  // List the files
  let files = list_files(dir_name);

  // Read them all
  let result = files.map(name => {
    let text = fs.readFileSync(dir_name + name, "utf-8");
    let result: FileContents = {
      name,
      text
    };
    return result;
  });
  return result;
}

export type FileHash = { [key: string]: FileContents };
function populate_hash(results: FileContents[]) {
  let hash: FileHash = {};
  results.forEach(f => {
    hash[f.name] = f;
  });
  return hash;
}

export function AllCounts(): FileHash {
  let results = read_files("tests/hdf_data/counts/");
  return populate_hash(results);
}

export function AllInfo(): FileHash {
  let results = read_files("tests/hdf_data/inspec_tools_info/");
  return populate_hash(results);
}

export function AllRaw(): FileHash {
  let results = read_files("tests/hdf_data/raw_data/");
  return populate_hash(results);
}
