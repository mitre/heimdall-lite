import { Module, VuexModule } from "vuex-module-decorators";
import Store from "@/store/store";

declare const process: {
  env: {
    PACKAGE_VERSION: string;
  };
};

@Module({
  namespaced: true,
  dynamic: true,
  store: Store,
  name: "appInfo"
})
class AppInfoModule extends VuexModule {
  /** The app version */
  version: string = process.env.PACKAGE_VERSION || "0";

  /** Idk lol */
  get foo(): string {
    return "bar";
  }
}

console.log("Hello?");
console.log("Is anyone... there???");

export default AppInfoModule;
