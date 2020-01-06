/* Provides async wrappers over various common functions/tasks */
import { fromBuffer, ZipFile, fromFd, Entry } from "yauzl";
import { Readable } from "stream";

/** Provides the resulting text of reading a file as a promise */
export async function read_file_async(
  file: File,
  buffer?: boolean
): Promise<string | ArrayBuffer> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onerror = () => {
      reader.abort();
      reject(new DOMException("Problem parsing input file."));
    };

    reader.onload = () => {
      if (reader.result !== null && reader.result !== undefined) {
        if (buffer) {
          resolve(reader.result);
        } else {
          resolve(reader.result.toString());
        }
      } else {
        reject(new DOMException("Problem parsing input file."));
      }
    };

    // Read based on whether we want it as a buffer
    if (buffer) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
}

export async function read_zip_async(file: File): Promise<ZipFile> {
  return new Promise((resolve, reject) => {
    // Reads the file and resolves into zipfile
    read_file_async(file, true).then(buffer => {
      let as_real_buffer = Buffer.from(buffer as ArrayBuffer);
      return fromBuffer(as_real_buffer, { lazyEntries: true }, (err, zip) => {
        if (err) {
          reject(err);
        } else if (zip) {
          resolve(zip);
        } else {
          reject(new Error("Unable to resolve zip for unknown reasons"));
        }
      });
    });
  });
}

export interface FileContents {
  name: string;
  text: string;
}

/** processes a ZipFile into a series of FileContents
 * Currently reads all files. If performance is a concern we could eventually make this more configurable
 */
export function zip_handle_each(
  zipfile: ZipFile
): Promise<Array<FileContents>> {
  return new Promise((resolve, reject) => {
    let pending_streams: Promise<FileContents>[] = [];

    // Set up the read loop
    zipfile.on("entry", (entry: Entry) => {
      if (/\/$/.test(entry.fileName)) {
        // Directory file names end with '/'.
        // Note that entires for directories themselves are optional.
        // An entry's fileName implicitly requires its parent directories to exist.
        zipfile.readEntry();
      } else {
        // file entry
        zipfile.openReadStream(entry, function(err, readStream) {
          if (err) throw err;

          // Make it loop - reading next file upon this ones termination
          readStream!.on("end", function() {
            zipfile.readEntry();
          });

          // Handle output - turn it into a zip entry
          let result_promise = stream_to_string(readStream!).then(text => {
            return {
              name: entry.fileName,
              text
            };
          });

          // Put it in the pending streams
          pending_streams.push(result_promise);
        });
      }
    });

    // Resolve and condense strings at the end
    zipfile.on("end", _ => {
      // Tell our pending streams what to do with their results
      // Wait for all pending streams
      resolve(Promise.all(pending_streams));
    });

    zipfile.readEntry();
  });
}

/** Condenses a stream into a string
 * From here:
 * https://stackoverflow.com/questions/10623798/how-do-i-read-the-contents-of-a-node-js-stream-into-a-string-variable
 * @param stream
 */
async function stream_to_string(stream: Readable): Promise<string> {
  const chunks: Uint8Array[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", chunk => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

/** Checks that a value is not null or undefined at a singular point.
 * Provides easy tracking of where data constraints aren't satisfied.
 */
export function defined<T>(x: T | null | undefined): T {
  if (x === null || x === undefined) {
    throw new Error("Value must not be null/undefined");
  } else {
    return x;
  }
}
