import { Module, VuexModule } from "vuex-module-decorators";
import Store from "@/store/store";

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
  version: string = `Ver.${process.env.PACKAGE_VERSION}`;

  /** The app description */
  description: string = process.env.DESCRIPTION;

  /** The app repository */
  repository: string = process.env.REPOSITORY;

  /** The app license */
  license: string = process.env.LICENSE;
}

export default AppInfoModule;
