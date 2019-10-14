import { Module, VuexModule } from "vuex-module-decorators";
import Store from "@/store/store";

/** Configure this to match data set in vue.config.ts */
declare const process: {
  env: {
    PACKAGE_VERSION: string;
    DESCRIPTION: string;
    REPOSITORY: string;
    LICENSE: string;
  };
};

@Module({
  namespaced: true,
  dynamic: true,
  store: Store,
  name: "info"
})
class AppInfoModule extends VuexModule {
  /** The app version */
  get version(): string {
    return `Ver.${process.env.PACKAGE_VERSION}`;
  }

  /** The app description */
  get description(): string {
    return process.env.DESCRIPTION;
  }

  /** The app repository */
  get repository(): string {
    return process.env.REPOSITORY;
  }

  /** The app license */
  get license(): string {
    return process.env.LICENSE;
  }
}

export default AppInfoModule;
