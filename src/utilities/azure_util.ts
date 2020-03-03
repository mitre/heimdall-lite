import {
  ContainerClient,
  BlobServiceClient,
  AnonymousCredential,
  newPipeline,
  BlobItem,
  BlobPrefix,
  ContainerItem,
  IHttpClient,
  WebResource,
  HttpOperationResponse
} from "@azure/storage-blob";
import { DefaultHttpClient } from "@azure/core-http";

/**
 * The x-ms-version for the default was giving an error. This http client
 * overrides the default x-ms-version allowing the request to succeed.
 */
export class PatchedHTTPClient implements IHttpClient {
  public async sendRequest(
    httpRequest: WebResource
  ): Promise<HttpOperationResponse> {
    // patch request to remove bad x-ms-version - this was causing a bad parameter error
    httpRequest.headers.remove("x-ms-version");

    // run request through default handler
    let defaultHttpClient = new DefaultHttpClient();
    return defaultHttpClient.sendRequest(httpRequest);
  }
}

/**
 * Format the blob account endpoint based on the given storage
 * name, storage account endpoint suffix, and sas token.
 *
 * @param {String} account_name The storage account name to connect to.
 * @param {String} account_suffix The suffix of the storage account, this is generally 'core.windows.net'.
 * @param {String} shared_access_signature The SAS token for the storage account.
 *
 * @return {String} The url of the blob account.
 */
export function get_blob_account_url(
  account_name: string,
  account_suffix: string,
  shared_access_signature: string
): string {
  return `https://${account_name}.blob.${account_suffix}${shared_access_signature}`;
}

/**
 * Initialize the blob service client based on either a connection string or an
 * account name, SAS token, and account suffix.
 *
 * @param {string} connection_string The full connection string to create the storage client connection. This can be undefined only if the other params are specified.
 * @param {string} account_name The name of the storage account. This can be undefined if connection string is specified.
 * @param {string} shared_access_signature The SAS token for the storage account. This can be undefined if connection string is specified.
 * @param {string} account_suffix The suffix of the storage account, this is generally 'core.windows.net'. This can be undefined if connection string is specified.
 *
 * @return {BlobServiceClient} The initiailized blob service client.
 */
export function get_storage_client(
  connection_string: string,
  account_name: string,
  shared_access_signature: string,
  account_suffix: string
): BlobServiceClient {
  let pipelineOptions = {
    retryOptions: { maxTries: 4 }, // Retry options
    httpClient: new PatchedHTTPClient()
  };
  const pipeline = newPipeline(new AnonymousCredential(), pipelineOptions);

  // get client by connection string
  if (connection_string) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      connection_string,
      pipelineOptions
    );
    return blobServiceClient;

    // get client by account name, suffix, and sas token
  } else {
    const blobServiceClient = new BlobServiceClient(
      // When using AnonymousCredential, following url should include a valid SAS or support public access
      get_blob_account_url(
        account_name,
        account_suffix,
        shared_access_signature
      ),
      pipeline
    );
    return blobServiceClient;
  }
}

/**
 * Get the container client for the given container.
 *
 * @param {BlobServiceClient} blob_service_client The initialized blob service client to use to fetch the container client.
 * @param {string} container_name The name of the container to fetch from blob service client.
 *
 * @return {ContainerClient} The container client for the given container.
 */
export function get_container_client(
  blob_service_client: BlobServiceClient,
  container_name: string
): ContainerClient {
  const containerClient = blob_service_client.getContainerClient(
    container_name
  );

  return containerClient;
}

/**
 * Fetch a list of containers from the blob service client.
 *
 * @param {BlobServiceClient} blob_service_client The initialized blob service client to fetch containers from.
 *
 * @return {Promise<Array<ContainerItem>>} An array of blob containers.
 */
export async function list_containers(
  blob_service_client: BlobServiceClient
): Promise<Array<ContainerItem>> {
  let containers: Array<ContainerItem> = [];

  for await (const container of blob_service_client.listContainers()) {
    containers.push(container);
  }

  return containers;
}

/**
 * List all blobs in the given container.
 *
 * @param {ContainerClient} container_client The initialized container client to fetch blobs from.
 *
 * @return {Promise<Array<BlobItem>>} The blobs from the container.
 */
export async function list_container_blobs(
  container_client: ContainerClient
): Promise<Array<BlobItem>> {
  let blobs: Array<BlobItem> = [];

  for await (const blob of container_client.listBlobsFlat()) {
    blobs.push(blob);
  }

  return blobs;
}

/**
 * Download a blob from the container and return the contents as a string.
 *
 * @param {ContainerClient} container_client The initialized container client to download the blob from.
 * @param {string} blob_name The name of the blob to download.
 *
 * @return {Promise<String>} The contents of the blob.
 */
export async function download_blob_file(
  container_client: ContainerClient,
  blob_name: string
): Promise<String> {
  let blobClient = container_client.getBlobClient(blob_name);

  // download blob and convert the contents to a string.
  return blobClient
    .download()
    .then(blob => {
      return blob.blobBody;
    })
    .then(body => {
      if (body) {
        return blobToString(body);
      } else {
        throw `Blob ${blob_name} does not exist in container ${container_client.containerName}`;
      }
    });
}

/**
 * Helper function to convert the blob to text.
 *
 * @param {Blob} blob The browser blob object to convert to text.
 *
 * @return {Promise<String>} The contents of the blob
 */
export async function blobToString(blob: Blob): Promise<String> {
  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onloadend = ev => {
      let v =
        ev && ev.target && ev.target.result ? ev.target.result : undefined;
      resolve(v as String);
    };
    fileReader.onerror = reject;
    fileReader.readAsText(blob);
  });
}

/**
 * List blobs in a container as though it were a file system and not flat files.
 *
 * It is equivalent to doing bash command 'ls $prefix'
 *
 * @param {ContainerClient} container_client The initialized container client to list blobs from.
 * @param {string | undefined} prefix The profile to list from.
 *
 * @return {Promise<(BlobPrefix | BlobItem)[]>} The blob item or the blob prefix. A blob item is equivalent to a file and a blob prefix is equivalent to a folder.
 */
export async function list_blobs_hierarchy(
  container_client: ContainerClient,
  prefix: string | undefined
): Promise<(BlobPrefix | BlobItem)[]> {
  let blobs: (BlobPrefix | BlobItem)[] = [];
  let iter = await container_client.listBlobsByHierarchy("/", {
    prefix: prefix
  });

  for await (const item of iter) {
    blobs.push(item);
  }

  return blobs;
}

/**
 * List blobs from a container. A container is a flat file system so it will list anything that begins with "prefix"
 *
 * @param {ContainerClient} container_client The container client to list blobs from.
 * @param {string} prefix The prefix to filter all blobs by.
 */
export async function list_blobs_flat(
  container_client: ContainerClient,
  prefix: string
): Promise<BlobItem[]> {
  let blobs: BlobItem[] = [];
  let iter = await container_client.listBlobsFlat({ prefix: prefix });

  for await (const item of iter) {
    blobs.push(item);
  }

  return blobs;
}
