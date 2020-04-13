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

  /** Attempts to login to the server */
  @Action
  async register(creds: LoginHash): Promise<void> {
    console.log(
      "Registering to " +
        this.connection!.url +
        "/auth/register" +
        " with " +
        creds["username"] +
        "/" +
        creds["password"]
    );
    //curl -X POST http://localhost:8050/auth/login -d '{"username": "blah", "password": "blaah"}' -H "Content-Type: application/json"
    return (
      fetch(this.connection!.url + "/auth/register", {
        body: `{"email": "${creds["username"]}", "password": "${creds["password"]}"}`,
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      })
        //.then(this.check_code)
        //.then(res => res.json())
        .then((v: Response) => {
          if (v.ok) {
            console.log("registration returned " + v.ok);
          } else {
            console.error(
              `Something went wrong: Got ${JSON.stringify(
                v
              )} for register response`
            );
            throw new ConnectionError(
              "BAD_RESPONSE",
              "Got unrecognized register response"
            );
          }
        })
    );
  }

  /** Attempts to login to the server */
  @Action
  async profile(): Promise<void> {
    console.log("Getting " + this.connection!.url + "/auth/profile");
    //curl http://localhost:3000/auth/profile -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."
    return (
      //fetch(this.connection!.url + '/auth/profile', {
      fetch(this.connection!.url + "/auth/profile", {
        headers: {
          //"Content-Type": "application/json",
          "Authorization:": `Bearer ${this.token}`
        },
        method: "GET"
      })
        //.then(this.check_code)
        .then(res => res.json())
        .then((v: any) => {
          console.log("got profile" + JSON.stringify(v));
          return v;
        })
    );
  }

  /** Our supposed role */
  // TODO:

  private async check_code(res: Response): Promise<Response> {
    // if ok, pass
    console.log("check_code res.ok: " + res.ok);
    if (res.ok) {
      console.log("check_code res.status: " + res.status);
      console.log("check_code res.body: " + res.body);
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
