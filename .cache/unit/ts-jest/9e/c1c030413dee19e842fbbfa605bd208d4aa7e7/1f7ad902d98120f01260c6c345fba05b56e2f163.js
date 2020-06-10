"use strict";
/**
 * Counts the statuses of controls.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const vuex_module_decorators_1 = require("vuex-module-decorators");
const data_filters_1 = tslib_1.__importStar(require("@/store/data_filters"));
const store_1 = tslib_1.__importDefault(require("@/store/store"));
const lru_cache_1 = tslib_1.__importDefault(require("lru-cache"));
const data_store_1 = tslib_1.__importDefault(require("@/store/data_store"));
// Helper function for counting a status in a list of controls
function count_statuses(data, filter) {
    // Remove the status filter from the control filter
    let new_filter = {
        status: undefined,
        ...filter
    };
    // Get the controls
    let controls = data.controls(new_filter);
    // Count 'em out
    let hash = {
        Failed: 0,
        "From Profile": 0,
        "Not Applicable": 0,
        "Not Reviewed": 0,
        Passed: 0,
        "Profile Error": 0
    };
    controls.forEach(c => {
        let status = c.root.hdf.status;
        hash[status] += 1;
    });
    // And we're done
    return hash;
}
let StatusCountModule = class StatusCountModule extends vuex_module_decorators_1.VuexModule {
    /** Use vuex caching to always have access to our filtered data module */
    get filtered_data() {
        return vuex_module_decorators_1.getModule(data_filters_1.default, store_1.default);
    }
    /** Ditto to base data, for dependency purposes */
    get inspec_data() {
        return vuex_module_decorators_1.getModule(data_store_1.default, store_1.default);
    }
    /** Generates a hash mapping each status -> a count of its members */
    get hash() {
        // Establish our cache and dependency
        let depends = this.inspec_data.contextualControls;
        let cache = new lru_cache_1.default(30);
        return (filter) => {
            let id = data_filters_1.filter_cache_key(filter);
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
    get passed() {
        return filter => this.hash(filter)["Passed"];
    }
    get failed() {
        return filter => this.hash(filter)["Failed"];
    }
    get notApplicable() {
        return filter => this.hash(filter)["Not Applicable"];
    }
    get notReviewed() {
        return filter => this.hash(filter)["Not Reviewed"];
    }
    get profileError() {
        return filter => this.hash(filter)["Profile Error"];
    }
    get fromProfile() {
        return filter => this.hash(filter)["From Profile"];
    }
};
StatusCountModule = tslib_1.__decorate([
    vuex_module_decorators_1.Module({
        namespaced: true,
        dynamic: true,
        store: store_1.default,
        name: "statusCounts"
    })
], StatusCountModule);
exports.default = StatusCountModule;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL3Nqb3NoaS90ZXN0L2hlaW1kYWxsLWxpdGUvc3JjL3N0b3JlL3N0YXR1c19jb3VudHMudHMiLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7QUFFSCxtRUFBdUU7QUFDdkUsNkVBQThFO0FBQzlFLGtFQUFrQztBQUNsQyxrRUFBaUM7QUFFakMsNEVBQWtEO0FBS2xELDhEQUE4RDtBQUM5RCxTQUFTLGNBQWMsQ0FBQyxJQUFrQixFQUFFLE1BQWM7SUFDeEQsbURBQW1EO0lBQ25ELElBQUksVUFBVSxHQUFXO1FBQ3ZCLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLEdBQUcsTUFBTTtLQUNWLENBQUM7SUFFRixtQkFBbUI7SUFDbkIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUV6QyxnQkFBZ0I7SUFDaEIsSUFBSSxJQUFJLEdBQWU7UUFDckIsTUFBTSxFQUFFLENBQUM7UUFDVCxjQUFjLEVBQUUsQ0FBQztRQUNqQixnQkFBZ0IsRUFBRSxDQUFDO1FBQ25CLGNBQWMsRUFBRSxDQUFDO1FBQ2pCLE1BQU0sRUFBRSxDQUFDO1FBQ1QsZUFBZSxFQUFFLENBQUM7S0FDbkIsQ0FBQztJQUNGLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDbkIsSUFBSSxNQUFNLEdBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxDQUFDO0lBRUgsaUJBQWlCO0lBQ2pCLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQVFELElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsbUNBQVU7SUFDeEMseUVBQXlFO0lBQ3pFLElBQVksYUFBYTtRQUN2QixPQUFPLGtDQUFTLENBQUMsc0JBQVksRUFBRSxlQUFLLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELElBQVksV0FBVztRQUNyQixPQUFPLGtDQUFTLENBQUMsb0JBQWdCLEVBQUUsZUFBSyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELHFFQUFxRTtJQUNyRSxJQUFJLElBQUk7UUFDTixxQ0FBcUM7UUFDckMsSUFBSSxPQUFPLEdBQVEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQztRQUN2RCxJQUFJLEtBQUssR0FBaUMsSUFBSSxtQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTNELE9BQU8sQ0FBQyxNQUFjLEVBQUUsRUFBRTtZQUN4QixJQUFJLEVBQUUsR0FBRywrQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsQyxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzNCLDZCQUE2QjtZQUM3QixJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ3hCLE9BQU8sTUFBTSxDQUFDO2FBQ2Y7WUFFRCx5Q0FBeUM7WUFDekMsSUFBSSxNQUFNLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDeEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdEIsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksTUFBTTtRQUNSLE9BQU8sTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxJQUFJLE1BQU07UUFDUixPQUFPLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2YsT0FBTyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ2IsT0FBTyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELElBQUksWUFBWTtRQUNkLE9BQU8sTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCxJQUFJLFdBQVc7UUFDYixPQUFPLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNyRCxDQUFDO0NBQ0YsQ0FBQTtBQXZESyxpQkFBaUI7SUFOdEIsK0JBQU0sQ0FBQztRQUNOLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLGVBQUs7UUFDWixJQUFJLEVBQUUsY0FBYztLQUNyQixDQUFDO0dBQ0ksaUJBQWlCLENBdUR0QjtBQUVELGtCQUFlLGlCQUFpQixDQUFDIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9zam9zaGkvdGVzdC9oZWltZGFsbC1saXRlL3NyYy9zdG9yZS9zdGF0dXNfY291bnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ291bnRzIHRoZSBzdGF0dXNlcyBvZiBjb250cm9scy5cbiAqL1xuXG5pbXBvcnQgeyBNb2R1bGUsIFZ1ZXhNb2R1bGUsIGdldE1vZHVsZSB9IGZyb20gXCJ2dWV4LW1vZHVsZS1kZWNvcmF0b3JzXCI7XG5pbXBvcnQgRmlsdGVyZWREYXRhLCB7IEZpbHRlciwgZmlsdGVyX2NhY2hlX2tleSB9IGZyb20gXCJAL3N0b3JlL2RhdGFfZmlsdGVyc1wiO1xuaW1wb3J0IFN0b3JlIGZyb20gXCJAL3N0b3JlL3N0b3JlXCI7XG5pbXBvcnQgTFJVQ2FjaGUgZnJvbSBcImxydS1jYWNoZVwiO1xuaW1wb3J0IHsgQ29udHJvbFN0YXR1cyB9IGZyb20gXCJpbnNwZWNqc1wiO1xuaW1wb3J0IEluc3BlY0RhdGFNb2R1bGUgZnJvbSBcIkAvc3RvcmUvZGF0YV9zdG9yZVwiO1xuXG4vLyBUaGUgaGFzaCB0aGF0IHdlIHdpbGwgZ2VuZXJhbGx5IGJlIHdvcmtpbmcgd2l0aCBoZXJlaW5cbmV4cG9ydCB0eXBlIFN0YXR1c0hhc2ggPSB7IFtrZXkgaW4gQ29udHJvbFN0YXR1c106IG51bWJlciB9O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb24gZm9yIGNvdW50aW5nIGEgc3RhdHVzIGluIGEgbGlzdCBvZiBjb250cm9sc1xuZnVuY3Rpb24gY291bnRfc3RhdHVzZXMoZGF0YTogRmlsdGVyZWREYXRhLCBmaWx0ZXI6IEZpbHRlcik6IFN0YXR1c0hhc2gge1xuICAvLyBSZW1vdmUgdGhlIHN0YXR1cyBmaWx0ZXIgZnJvbSB0aGUgY29udHJvbCBmaWx0ZXJcbiAgbGV0IG5ld19maWx0ZXI6IEZpbHRlciA9IHtcbiAgICBzdGF0dXM6IHVuZGVmaW5lZCxcbiAgICAuLi5maWx0ZXJcbiAgfTtcblxuICAvLyBHZXQgdGhlIGNvbnRyb2xzXG4gIGxldCBjb250cm9scyA9IGRhdGEuY29udHJvbHMobmV3X2ZpbHRlcik7XG5cbiAgLy8gQ291bnQgJ2VtIG91dFxuICBsZXQgaGFzaDogU3RhdHVzSGFzaCA9IHtcbiAgICBGYWlsZWQ6IDAsXG4gICAgXCJGcm9tIFByb2ZpbGVcIjogMCxcbiAgICBcIk5vdCBBcHBsaWNhYmxlXCI6IDAsXG4gICAgXCJOb3QgUmV2aWV3ZWRcIjogMCxcbiAgICBQYXNzZWQ6IDAsXG4gICAgXCJQcm9maWxlIEVycm9yXCI6IDBcbiAgfTtcbiAgY29udHJvbHMuZm9yRWFjaChjID0+IHtcbiAgICBsZXQgc3RhdHVzOiBDb250cm9sU3RhdHVzID0gYy5yb290LmhkZi5zdGF0dXM7XG4gICAgaGFzaFtzdGF0dXNdICs9IDE7XG4gIH0pO1xuXG4gIC8vIEFuZCB3ZSdyZSBkb25lXG4gIHJldHVybiBoYXNoO1xufVxuXG5ATW9kdWxlKHtcbiAgbmFtZXNwYWNlZDogdHJ1ZSxcbiAgZHluYW1pYzogdHJ1ZSxcbiAgc3RvcmU6IFN0b3JlLFxuICBuYW1lOiBcInN0YXR1c0NvdW50c1wiXG59KVxuY2xhc3MgU3RhdHVzQ291bnRNb2R1bGUgZXh0ZW5kcyBWdWV4TW9kdWxlIHtcbiAgLyoqIFVzZSB2dWV4IGNhY2hpbmcgdG8gYWx3YXlzIGhhdmUgYWNjZXNzIHRvIG91ciBmaWx0ZXJlZCBkYXRhIG1vZHVsZSAqL1xuICBwcml2YXRlIGdldCBmaWx0ZXJlZF9kYXRhKCk6IEZpbHRlcmVkRGF0YSB7XG4gICAgcmV0dXJuIGdldE1vZHVsZShGaWx0ZXJlZERhdGEsIFN0b3JlKTtcbiAgfVxuXG4gIC8qKiBEaXR0byB0byBiYXNlIGRhdGEsIGZvciBkZXBlbmRlbmN5IHB1cnBvc2VzICovXG4gIHByaXZhdGUgZ2V0IGluc3BlY19kYXRhKCk6IEluc3BlY0RhdGFNb2R1bGUge1xuICAgIHJldHVybiBnZXRNb2R1bGUoSW5zcGVjRGF0YU1vZHVsZSwgU3RvcmUpO1xuICB9XG5cbiAgLyoqIEdlbmVyYXRlcyBhIGhhc2ggbWFwcGluZyBlYWNoIHN0YXR1cyAtPiBhIGNvdW50IG9mIGl0cyBtZW1iZXJzICovXG4gIGdldCBoYXNoKCk6IChmaWx0ZXI6IEZpbHRlcikgPT4gU3RhdHVzSGFzaCB7XG4gICAgLy8gRXN0YWJsaXNoIG91ciBjYWNoZSBhbmQgZGVwZW5kZW5jeVxuICAgIGxldCBkZXBlbmRzOiBhbnkgPSB0aGlzLmluc3BlY19kYXRhLmNvbnRleHR1YWxDb250cm9scztcbiAgICBsZXQgY2FjaGU6IExSVUNhY2hlPHN0cmluZywgU3RhdHVzSGFzaD4gPSBuZXcgTFJVQ2FjaGUoMzApO1xuXG4gICAgcmV0dXJuIChmaWx0ZXI6IEZpbHRlcikgPT4ge1xuICAgICAgbGV0IGlkID0gZmlsdGVyX2NhY2hlX2tleShmaWx0ZXIpO1xuICAgICAgbGV0IGNhY2hlZCA9IGNhY2hlLmdldChpZCk7XG4gICAgICAvLyBJZiBjYWNoZSBoaXRzLCBqdXN0IHJldHVyblxuICAgICAgaWYgKGNhY2hlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBjYWNoZWQ7XG4gICAgICB9XG5cbiAgICAgIC8vIEVsc2V3aXNlLCBnZW5lcmF0ZSwgY2FjaGUsIHRoZW4gcmV0dXJuXG4gICAgICBsZXQgcmVzdWx0ID0gY291bnRfc3RhdHVzZXModGhpcy5maWx0ZXJlZF9kYXRhLCBmaWx0ZXIpO1xuICAgICAgY2FjaGUuc2V0KGlkLCByZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9XG5cbiAgZ2V0IHBhc3NlZCgpOiAoZmlsdGVyOiBGaWx0ZXIpID0+IG51bWJlciB7XG4gICAgcmV0dXJuIGZpbHRlciA9PiB0aGlzLmhhc2goZmlsdGVyKVtcIlBhc3NlZFwiXTtcbiAgfVxuXG4gIGdldCBmYWlsZWQoKTogKGZpbHRlcjogRmlsdGVyKSA9PiBudW1iZXIge1xuICAgIHJldHVybiBmaWx0ZXIgPT4gdGhpcy5oYXNoKGZpbHRlcilbXCJGYWlsZWRcIl07XG4gIH1cblxuICBnZXQgbm90QXBwbGljYWJsZSgpOiAoZmlsdGVyOiBGaWx0ZXIpID0+IG51bWJlciB7XG4gICAgcmV0dXJuIGZpbHRlciA9PiB0aGlzLmhhc2goZmlsdGVyKVtcIk5vdCBBcHBsaWNhYmxlXCJdO1xuICB9XG5cbiAgZ2V0IG5vdFJldmlld2VkKCk6IChmaWx0ZXI6IEZpbHRlcikgPT4gbnVtYmVyIHtcbiAgICByZXR1cm4gZmlsdGVyID0+IHRoaXMuaGFzaChmaWx0ZXIpW1wiTm90IFJldmlld2VkXCJdO1xuICB9XG5cbiAgZ2V0IHByb2ZpbGVFcnJvcigpOiAoZmlsdGVyOiBGaWx0ZXIpID0+IG51bWJlciB7XG4gICAgcmV0dXJuIGZpbHRlciA9PiB0aGlzLmhhc2goZmlsdGVyKVtcIlByb2ZpbGUgRXJyb3JcIl07XG4gIH1cblxuICBnZXQgZnJvbVByb2ZpbGUoKTogKGZpbHRlcjogRmlsdGVyKSA9PiBudW1iZXIge1xuICAgIHJldHVybiBmaWx0ZXIgPT4gdGhpcy5oYXNoKGZpbHRlcilbXCJGcm9tIFByb2ZpbGVcIl07XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3RhdHVzQ291bnRNb2R1bGU7XG4iXSwidmVyc2lvbiI6M30=