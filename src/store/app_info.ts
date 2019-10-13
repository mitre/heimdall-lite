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
const process_immut = Object.freeze(Object.assign({}, process.env));

@Module({
  namespaced: true,
  dynamic: true,
  store: Store,
  name: "info"
})
class AppInfoModule extends VuexModule {
  /** The app version */
  version: Readonly<string> = `Ver.${process_immut.PACKAGE_VERSION}`;

  /** The app description */
  description: Readonly<string> = process_immut.DESCRIPTION;

  /** The app repository */
  repository: Readonly<string> = process_immut.REPOSITORY;

  /** The app license */
  license: Readonly<string> = process_immut.LICENSE;
}

export default AppInfoModule;
