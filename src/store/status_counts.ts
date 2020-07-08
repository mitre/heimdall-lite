/**
 * Counts the statuses of controls.
 */

import { Module, VuexModule, getModule } from "vuex-module-decorators";
import FilteredData, { Filter, filter_cache_key } from "@/store/data_filters";
import Store from "@/store/store";
import LRUCache from "lru-cache";
import { ControlStatus } from "inspecjs";
import InspecDataModule from "@/store/data_store";

// The hash that we will generally be working with herein
export type ControlStatusHash = { [key in ControlStatus]: number };
export type StatusHash = ControlStatusHash & {
  passedTests: number; // from passed controls
  failedTests: number;
  failedOutOf: number; // total tests from failed controls
  notApplicableTests: number;
  notReviewedTests: number;
  erroredOutOf: number;
  erroredTests: number;
};

// Helper function for counting a status in a list of controls
function count_statuses(data: FilteredData, filter: Filter): StatusHash {
  // Remove the status filter from the control filter
  let new_filter: Filter = {
    status: undefined,
    ...filter
  };

  // Get the controls
  let controls = data.controls(new_filter);

  // Count 'em out
  let hash: StatusHash = {
    Failed: 0,
    "From Profile": 0,
    "Not Applicable": 0,
    "Not Reviewed": 0,
    Passed: 0,
    "Profile Error": 0,
    passedTests: 0,
    failedTests: 0,
    failedOutOf: 0,
    notApplicableTests: 0,
    notReviewedTests: 0,
    erroredOutOf: 0,
    erroredTests: 0
  };
  controls.forEach(c => {
    c = c.root;
    let status: ControlStatus = c.hdf.status;
    hash[status] += 1;
    if (status == "Passed") {
      hash.passedTests += (c.hdf.segments || []).length;
    } else if (status == "Failed") {
      hash.failedOutOf += (c.hdf.segments || []).length;
      hash.failedTests += (c.hdf.segments || []).filter(
        s => s.status == "failed"
      ).length;
    } else if (status == "Not Applicable") {
      hash.notApplicableTests += (c.hdf.segments || []).length;
    } else if (status == "Not Reviewed") {
      hash.notReviewedTests += (c.hdf.segments || []).length;
    } else if (status == "Profile Error") {
      hash.erroredOutOf += (c.hdf.segments || []).length;
      hash.erroredTests += (c.hdf.segments || []).filter(
        s => s.status == "error"
      ).length;
    }
  });

  // And we're done
  return hash;
}

@Module({
  namespaced: true,
  dynamic: true,
  store: Store,
  name: "statusCounts"
})
class StatusCountModule extends VuexModule {
  /** Use vuex caching to always have access to our filtered data module */
  private get filtered_data(): FilteredData {
    return getModule(FilteredData, Store);
  }

  /** Ditto to base data, for dependency purposes */
  private get inspec_data(): InspecDataModule {
    return getModule(InspecDataModule, Store);
  }

  /** Generates a hash mapping each status -> a count of its members */
  get hash(): (filter: Filter) => StatusHash {
    // Establish our cache and dependency
    let depends: any = this.inspec_data.contextualControls;
    let cache: LRUCache<string, StatusHash> = new LRUCache(30);

    return (filter: Filter) => {
      let id = filter_cache_key(filter);
      let cached = cache.get(id);
      // If cache hits, just return
      if (cached !== undefined) {
        return cached;
      }

      // Elsewise, generate, cache, then return
      let result = count_statuses(this.filtered_data, filter);
      cache.set(id, result);
      return result;
    };
  }

  get passed(): (filter: Filter) => number {
    return filter => this.hash(filter)["Passed"];
  }

  get failed(): (filter: Filter) => number {
    return filter => this.hash(filter)["Failed"];
  }

  get notApplicable(): (filter: Filter) => number {
    return filter => this.hash(filter)["Not Applicable"];
  }

  get notReviewed(): (filter: Filter) => number {
    return filter => this.hash(filter)["Not Reviewed"];
  }

  get profileError(): (filter: Filter) => number {
    return filter => this.hash(filter)["Profile Error"];
  }

  get fromProfile(): (filter: Filter) => number {
    return filter => this.hash(filter)["From Profile"];
  }

  get passedTests(): (filter: Filter) => number {
    return filter => this.hash(filter)["passedTests"];
  }

  get failedTests(): (filter: Filter) => number {
    return filter => this.hash(filter)["failedTests"];
  }

  get failedOutOf(): (filter: Filter) => number {
    return filter => this.hash(filter)["failedOutOf"];
  }

  get notApplicableTests(): (filter: Filter) => number {
    return filter => this.hash(filter)["notApplicableTests"];
  }

  get notReviewedTests(): (filter: Filter) => number {
    return filter => this.hash(filter)["notReviewedTests"];
  }

  get erroredTests(): (filter: Filter) => number {
    return filter => this.hash(filter)["erroredTests"];
  }

  get erroredOutOf(): (filter: Filter) => number {
    return filter => this.hash(filter)["erroredOutOf"];
  }
}

export default StatusCountModule;
