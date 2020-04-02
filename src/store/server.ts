import {
  Module,
  VuexModule,
  getModule,
  Mutation,
  Action
} from "vuex-module-decorators";
import Store from "@/store/store";
import { LocalStorageVal } from "@/utilities/helper_util";

export interface LoginHash {
  username: string;
  password: string;
}
const local_token = new LocalStorageVal<string | null>("auth_token");

type ConnErrorType =
  | "NO_CONNECTION"
  | "BAD_CONNECTION"
  | "BAD_LOGIN"
  | "UNAUTHORIZED"
  | "BAD_RESPONSE"
  | "UNKNOWN";
export class ConnectionError extends Error {
  constructor(readonly type: ConnErrorType, readonly message: string) {
    super(`${type} - ${message}`);
  }
}

export class HSConnectionConfig {
  constructor(readonly url: string) {}

  /** Checks whether the connection works. If it succeeds, then assume all is well */
  async check(): Promise<void> {
    return fetch(this.url, { method: "get" })
      .then(response => response.text())
      .then(text => {
        if (text != "HS_ALIVE") {
          throw new ConnectionError("BAD_CONNECTION", "Connection failed");
        }
      });
  }
}

@Module({
  namespaced: true,
  dynamic: true,
  store: Store,
  name: "heimdallServer"
})
class HeimdallServerModule extends VuexModule {
  /** Our current target server parameters */
  connection: HSConnectionConfig | null = null;

  @Mutation
  set_connection(new_url: string) {
    this.connection = new HSConnectionConfig(new_url);
  }

  @Action
  async connect(new_url: string): Promise<void> {
    this.set_connection(new_url);
  }

  /** Our currently granted JWT token */
  token: string | null = local_token.get();

  /** Mutation to set above, as well as to update our localstorage */
  @Mutation
  set_token(new_token: string | null) {
    this.token = new_token;
    console.log("server.ts - set token: " + this.token);
    local_token.set(new_token);
  }

  /* Actions to authorize and set token */
  @Action
  clear_token() {
    this.set_token(null);
  }

  /** Attempts to login to the server */
  @Action
  async login(creds: LoginHash): Promise<void> {
    console.log(
      "Logging in to " +
        this.connection!.url +
        "/auth/login" +
        " with " +
        creds["username"] +
        "/" +
        creds["password"]
    );
    //this.requires_connection();
    console.log("has connection");
    //curl -X POST http://localhost:8050/auth/login -d '{"username": "blah", "password": "blaah"}' -H "Content-Type: application/json"
    return fetch(this.connection!.url + "/auth/login", {
      body: `{"username": "${creds["username"]}", "password": "${creds["password"]}"}`,
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    })
      .then(this.check_code)
      .then(res => res.json())
      .then((v: any) => {
        if (typeof v === "object") {
          this.set_token(v.access_token);
          console.log("got token" + v.access_token);
        } else {
          console.error(
            `Something went wrong: Got ${v.access_token} for login response`
          );
          throw new ConnectionError(
            "BAD_RESPONSE",
            "Got unrecognized login response"
          );
        }
      });
  }

  /** Our supposed role */
  // TODO:

  private requires_connection() {
    if (!this.connection) {
      console.error("Attempted to login without valid connection!");
      throw new ConnectionError("NO_CONNECTION", "Invalid vuex state");
    }
  }

  private async check_code(res: Response): Promise<Response> {
    // if ok, pass
    console.log("check_code");
    if (res.ok) {
      return res;
    }

    switch (res.status) {
      case 401:
        throw new ConnectionError("UNAUTHORIZED", res.statusText);
      default:
        throw new ConnectionError("UNKNOWN", res.statusText);
    }
  }
}

export default HeimdallServerModule;
