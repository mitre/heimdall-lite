/**
 * Provides mechanisms for quickly looking up resources by specific ids.
 * This is generally much faster than attempting to do so by filtering, and furthermore doesn't screw our caches.
 * Currently supported mappings are:
 * - Control ID -> All controls with that id
 */
import {Module, VuexModule, getModule} from 'vuex-module-decorators';
import {InspecDataModule} from '@/store/data_store';
import {context} from 'inspecjs';
import Store from '@/store/store';

// Control ID hash
export type ControlHash = {[key: string]: context.ContextualizedControl[]};

@Module({
  namespaced: true,
  dynamic: true,
  store: Store,
  name: 'lookup'
})
export class HashLookup extends VuexModule {
  /**
   * Returns a hash of all controls keyed by their ids.
   * Note that each key is a list - This is to accomodate the case in which IDs overlap, e.g. when many files are loaded.
   * The user of this function must personally filter this data as appropriate.
   */
  get controls(): Readonly<ControlHash> {
    // Make the hash
    const final: ControlHash = {};

    // Add every control to it.
    InspecDataModule.contextualControls.forEach(c => {
      if (c.data.id in final) {
        final[c.data.id].push(c);
      } else {
        final[c.data.id] = [c];
      }
    });

    // Return
    return Object.freeze(final);
  }
}

export const HashLookupModule = getModule(HashLookup);
