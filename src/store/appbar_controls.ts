/**
 * Tracks uploaded files, and their parsed contents
 */

import { Module, VuexModule, Action, getModule } from "vuex-module-decorators";
import Store from "@/store/store";

@Module({
  namespaced: true,
  dynamic: true,
  store: Store,
  name: "appbar_controls"
})
class AppbarControlsModule extends VuexModule {}

export default AppbarControlsModule;
