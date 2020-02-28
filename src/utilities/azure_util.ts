import {
  ContainerClient,
  BlobServiceClient,
  AnonymousCredential,
  newPipeline,
  BlobDownloadResponseModel,
  BlobItem,
  BlobPrefix,
  ContainerItem,
  IHttpClient,
  WebResource,
  HttpOperationResponse
} from "@azure/storage-blob";
import { DefaultHttpClient } from "@azure/core-http";
import { blob } from "d3";

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

/** represents the auth credentials for aws stuff */
export interface AuthCreds {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}

/** represents the information of the current used */
export interface AuthInfo {
  expiration?: Date;
  user_account: string;
  user_id: string;
}

/** bundles the above two */
export interface Auth {
  creds: AuthCreds;
  info: AuthInfo;
}

export function get_blob_account_url(
  account_name: string,
  account_suffix: string,
  shared_access_signature: string
): string {
  return `https://${account_name}.blob.${account_suffix}${shared_access_signature}`;
}

/** Attempts to retrieve an aws temporary session using the given information.
 * Yields the session info on success.
 * Yields the AWS error on failure.
 */
export function get_storage_client(
  connection_string: string,
  account_name: string,
  shared_access_signature: string,
  account_suffix: string
): BlobServiceClient {
  let pipelineOptions = {
    retryOptions: { maxTries: 4 }, // Retry options
    userAgentOptions: { userAgentPrefix: "AdvancedSample V1.0.0" }, // Customized telemetry string
    keepAliveOptions: {
      // Keep alive is enabled by default, disable keep alive by setting false
      enable: false
    },
    httpClient: new PatchedHTTPClient()
  };
  const pipeline = newPipeline(new AnonymousCredential(), pipelineOptions);

  if (connection_string) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      connection_string,
      pipelineOptions
    );
    return blobServiceClient;
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

export function get_container_client(
  blob_service_client: BlobServiceClient,
  container_name: string
): ContainerClient {
  const containerClient = blob_service_client.getContainerClient(
    container_name
  );

  return containerClient;
}

export async function list_containers(
  blob_service_client: BlobServiceClient
): Promise<Array<ContainerItem>> {
  let containers: Array<ContainerItem> = [];

  let i = 1;
  for await (const container of blob_service_client.listContainers()) {
    containers.push(container);
  }

  return containers;
}

export async function list_container_blobs(
  container_client: ContainerClient
): Promise<Array<BlobItem>> {
  let blobs: Array<BlobItem> = [];

  let i = 1;
  for await (const blob of container_client.listBlobsFlat()) {
    blobs.push(blob);
  }

  return blobs;
}

export async function download_blob_file(
  container_client: ContainerClient,
  blob_name: string
): Promise<String> {
  let blobClient = container_client.getBlobClient(blob_name);
  return blobClient
    .download()
    .then(blob => {
      return blob.blobBody;
    })
    .then(body => {
      if (body) {
        // @ts-ignore
        return body.text();
      } else {
        throw `Blob ${blob_name} does not exist in container ${container_client.containerName}`;
      }
    });
}

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
