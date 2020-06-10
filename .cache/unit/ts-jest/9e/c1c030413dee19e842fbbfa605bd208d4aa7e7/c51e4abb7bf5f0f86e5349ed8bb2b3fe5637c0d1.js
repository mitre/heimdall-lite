"use strict";
/**
 * Tracks uploaded files, and their parsed contents
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const vuex_module_decorators_1 = require("vuex-module-decorators");
const inspecjs_1 = require("inspecjs");
const store_1 = tslib_1.__importDefault(require("@/store/store"));
function isFromProfileFile(p) {
    return p.sourced_from === null;
}
exports.isFromProfileFile = isFromProfileFile;
let InspecDataModule = class InspecDataModule extends vuex_module_decorators_1.VuexModule {
    constructor() {
        super(...arguments);
        /** State var containing all execution files that have been added */
        this.executionFiles = [];
        /** State var containing all profile files that have been added */
        this.profileFiles = [];
    }
    /** Return all of the files that we currently have. */
    get allFiles() {
        let result = [];
        result.push(...this.executionFiles);
        result.push(...this.profileFiles);
        return result;
    }
    /**
     * Recompute all contextual data
     */
    get contextStore() {
        // Initialize all our arrays
        let executions = [];
        let profiles = [];
        let controls = [];
        // Process our data
        for (let f of this.executionFiles) {
            let fc = inspecjs_1.context.contextualizeEvaluation(f.execution);
            let sfc = fc;
            sfc.from_file = f;
            executions.push(Object.freeze(sfc));
            profiles.push(...fc.contains);
        }
        for (let f of this.profileFiles) {
            let fc = inspecjs_1.context.contextualizeProfile(f.profile);
            let sfc = fc;
            sfc.from_file = f;
            profiles.push(Object.freeze(sfc));
        }
        for (let p of profiles) {
            controls.push(...p.contains);
        }
        return [executions, profiles, controls];
    }
    /**
     * Returns a readonly list of all executions currently held in the data store
     * including associated context
     */
    get contextualExecutions() {
        return this.contextStore[0];
    }
    /**
     * Returns a readonly list of all profiles currently held in the data store
     * including associated context
     */
    get contextualProfiles() {
        return this.contextStore[1];
    }
    /**
     * Returns a readonly list of all controls currently held in the data store
     * including associated context
     */
    get contextualControls() {
        return this.contextStore[2];
    }
    /**
     * Adds a profile file to the store.
     * @param newProfile The profile to add
     */
    addProfile(newProfile) {
        this.profileFiles.push(newProfile);
    }
    /**
     * Adds an execution file to the store.
     * @param newExecution The execution to add
     */
    addExecution(newExecution) {
        this.executionFiles.push(newExecution);
    }
    /**
     * Unloads the file with the given id
     */
    removeFile(file_id) {
        this.profileFiles = this.profileFiles.filter(pf => pf.unique_id !== file_id);
        this.executionFiles = this.executionFiles.filter(ef => ef.unique_id !== file_id);
    }
    /**
     * Clear all stored data.
     */
    reset() {
        this.profileFiles = [];
        this.executionFiles = [];
    }
};
tslib_1.__decorate([
    vuex_module_decorators_1.Mutation
], InspecDataModule.prototype, "addProfile", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Mutation
], InspecDataModule.prototype, "addExecution", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Mutation
], InspecDataModule.prototype, "removeFile", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Mutation
], InspecDataModule.prototype, "reset", null);
InspecDataModule = tslib_1.__decorate([
    vuex_module_decorators_1.Module({
        namespaced: true,
        dynamic: true,
        store: store_1.default,
        name: "data"
    })
], InspecDataModule);
exports.default = InspecDataModule;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL3Nqb3NoaS90ZXN0L2hlaW1kYWxsLWxpdGUvc3JjL3N0b3JlL2RhdGFfc3RvcmUudHMiLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7QUFFSCxtRUFBOEU7QUFDOUUsdUNBT2tCO0FBRWxCLGtFQUFrQztBQVFsQyxTQUFnQixpQkFBaUIsQ0FDL0IsQ0FBZ0M7SUFFaEMsT0FBTyxDQUFDLENBQUMsWUFBWSxLQUFLLElBQUksQ0FBQztBQUNqQyxDQUFDO0FBSkQsOENBSUM7QUFhRCxJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFpQixTQUFRLG1DQUFVO0lBQXpDOztRQUNFLG9FQUFvRTtRQUNwRSxtQkFBYyxHQUFxQixFQUFFLENBQUM7UUFFdEMsa0VBQWtFO1FBQ2xFLGlCQUFZLEdBQWtCLEVBQUUsQ0FBQztJQTZHbkMsQ0FBQztJQTNHQyxzREFBc0Q7SUFDdEQsSUFBSSxRQUFRO1FBQ1YsSUFBSSxNQUFNLEdBQXFDLEVBQUUsQ0FBQztRQUNsRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbEMsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSSxZQUFZO1FBS2QsNEJBQTRCO1FBQzVCLElBQUksVUFBVSxHQUFzQyxFQUFFLENBQUM7UUFDdkQsSUFBSSxRQUFRLEdBQW9DLEVBQUUsQ0FBQztRQUNuRCxJQUFJLFFBQVEsR0FBb0MsRUFBRSxDQUFDO1FBRW5ELG1CQUFtQjtRQUNuQixLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDakMsSUFBSSxFQUFFLEdBQUcsa0JBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEQsSUFBSSxHQUFHLEdBQUksRUFBaUQsQ0FBQztZQUM3RCxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztZQUNsQixVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNwQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQy9CO1FBRUQsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQy9CLElBQUksRUFBRSxHQUFHLGtCQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2pELElBQUksR0FBRyxHQUFJLEVBQThDLENBQUM7WUFDMUQsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDbEIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDbkM7UUFFRCxLQUFLLElBQUksQ0FBQyxJQUFJLFFBQVEsRUFBRTtZQUN0QixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzlCO1FBRUQsT0FBTyxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVEOzs7T0FHRztJQUNILElBQUksb0JBQW9CO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsSUFBSSxrQkFBa0I7UUFDcEIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxJQUFJLGtCQUFrQjtRQUNwQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7T0FHRztJQUVILFVBQVUsQ0FBQyxVQUF1QjtRQUNoQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7OztPQUdHO0lBRUgsWUFBWSxDQUFDLFlBQTRCO1FBQ3ZDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7T0FFRztJQUVILFVBQVUsQ0FBQyxPQUFlO1FBQ3hCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQzFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFNBQVMsS0FBSyxPQUFPLENBQy9CLENBQUM7UUFDRixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUM5QyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEtBQUssT0FBTyxDQUMvQixDQUFDO0lBQ0osQ0FBQztJQUVEOztPQUVHO0lBRUgsS0FBSztRQUNILElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0lBQzNCLENBQUM7Q0FDRixDQUFBO0FBbENDO0lBREMsaUNBQVE7a0RBR1I7QUFPRDtJQURDLGlDQUFRO29EQUdSO0FBTUQ7SUFEQyxpQ0FBUTtrREFRUjtBQU1EO0lBREMsaUNBQVE7NkNBSVI7QUFqSEcsZ0JBQWdCO0lBTnJCLCtCQUFNLENBQUM7UUFDTixVQUFVLEVBQUUsSUFBSTtRQUNoQixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxlQUFLO1FBQ1osSUFBSSxFQUFFLE1BQU07S0FDYixDQUFDO0dBQ0ksZ0JBQWdCLENBa0hyQjtBQUVELGtCQUFlLGdCQUFnQixDQUFDIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9zam9zaGkvdGVzdC9oZWltZGFsbC1saXRlL3NyYy9zdG9yZS9kYXRhX3N0b3JlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVHJhY2tzIHVwbG9hZGVkIGZpbGVzLCBhbmQgdGhlaXIgcGFyc2VkIGNvbnRlbnRzXG4gKi9cblxuaW1wb3J0IHsgTW9kdWxlLCBWdWV4TW9kdWxlLCBNdXRhdGlvbiwgQWN0aW9uIH0gZnJvbSBcInZ1ZXgtbW9kdWxlLWRlY29yYXRvcnNcIjtcbmltcG9ydCB7XG4gIEhERkNvbnRyb2wsXG4gIHBhcnNlLFxuICBzY2hlbWFzXzFfMCxcbiAgaGRmV3JhcENvbnRyb2wsXG4gIENvbnRyb2xTdGF0dXMsXG4gIGNvbnRleHRcbn0gZnJvbSBcImluc3BlY2pzXCI7XG5pbXBvcnQgeyBGaWxlSUQsIEV2YWx1YXRpb25GaWxlLCBQcm9maWxlRmlsZSB9IGZyb20gXCJAL3N0b3JlL3JlcG9ydF9pbnRha2VcIjtcbmltcG9ydCBTdG9yZSBmcm9tIFwiQC9zdG9yZS9zdG9yZVwiO1xuXG4vKiogV2UgbWFrZSBzb21lIG5ldyB2YXJpYW50IHR5cGVzIG9mIHRoZSBDb250ZXh0dWFsIHR5cGVzLCB0byBpbmNsdWRlIHRoZWlyIGZpbGVzKi9cbmV4cG9ydCBpbnRlcmZhY2UgU291cmNlZENvbnRleHR1YWxpemVkUHJvZmlsZVxuICBleHRlbmRzIGNvbnRleHQuQ29udGV4dHVhbGl6ZWRQcm9maWxlIHtcbiAgZnJvbV9maWxlOiBQcm9maWxlRmlsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnJvbVByb2ZpbGVGaWxlKFxuICBwOiBjb250ZXh0LkNvbnRleHR1YWxpemVkUHJvZmlsZVxuKTogcCBpcyBTb3VyY2VkQ29udGV4dHVhbGl6ZWRQcm9maWxlIHtcbiAgcmV0dXJuIHAuc291cmNlZF9mcm9tID09PSBudWxsO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNvdXJjZWRDb250ZXh0dWFsaXplZEV2YWx1YXRpb25cbiAgZXh0ZW5kcyBjb250ZXh0LkNvbnRleHR1YWxpemVkRXZhbHVhdGlvbiB7XG4gIGZyb21fZmlsZTogRXZhbHVhdGlvbkZpbGU7XG59XG5cbkBNb2R1bGUoe1xuICBuYW1lc3BhY2VkOiB0cnVlLFxuICBkeW5hbWljOiB0cnVlLFxuICBzdG9yZTogU3RvcmUsXG4gIG5hbWU6IFwiZGF0YVwiXG59KVxuY2xhc3MgSW5zcGVjRGF0YU1vZHVsZSBleHRlbmRzIFZ1ZXhNb2R1bGUge1xuICAvKiogU3RhdGUgdmFyIGNvbnRhaW5pbmcgYWxsIGV4ZWN1dGlvbiBmaWxlcyB0aGF0IGhhdmUgYmVlbiBhZGRlZCAqL1xuICBleGVjdXRpb25GaWxlczogRXZhbHVhdGlvbkZpbGVbXSA9IFtdO1xuXG4gIC8qKiBTdGF0ZSB2YXIgY29udGFpbmluZyBhbGwgcHJvZmlsZSBmaWxlcyB0aGF0IGhhdmUgYmVlbiBhZGRlZCAqL1xuICBwcm9maWxlRmlsZXM6IFByb2ZpbGVGaWxlW10gPSBbXTtcblxuICAvKiogUmV0dXJuIGFsbCBvZiB0aGUgZmlsZXMgdGhhdCB3ZSBjdXJyZW50bHkgaGF2ZS4gKi9cbiAgZ2V0IGFsbEZpbGVzKCk6IChFdmFsdWF0aW9uRmlsZSB8IFByb2ZpbGVGaWxlKVtdIHtcbiAgICBsZXQgcmVzdWx0OiAoRXZhbHVhdGlvbkZpbGUgfCBQcm9maWxlRmlsZSlbXSA9IFtdO1xuICAgIHJlc3VsdC5wdXNoKC4uLnRoaXMuZXhlY3V0aW9uRmlsZXMpO1xuICAgIHJlc3VsdC5wdXNoKC4uLnRoaXMucHJvZmlsZUZpbGVzKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY29tcHV0ZSBhbGwgY29udGV4dHVhbCBkYXRhXG4gICAqL1xuICBnZXQgY29udGV4dFN0b3JlKCk6IFtcbiAgICByZWFkb25seSBTb3VyY2VkQ29udGV4dHVhbGl6ZWRFdmFsdWF0aW9uW10sXG4gICAgcmVhZG9ubHkgY29udGV4dC5Db250ZXh0dWFsaXplZFByb2ZpbGVbXSxcbiAgICByZWFkb25seSBjb250ZXh0LkNvbnRleHR1YWxpemVkQ29udHJvbFtdXG4gIF0ge1xuICAgIC8vIEluaXRpYWxpemUgYWxsIG91ciBhcnJheXNcbiAgICBsZXQgZXhlY3V0aW9uczogU291cmNlZENvbnRleHR1YWxpemVkRXZhbHVhdGlvbltdID0gW107XG4gICAgbGV0IHByb2ZpbGVzOiBjb250ZXh0LkNvbnRleHR1YWxpemVkUHJvZmlsZVtdID0gW107XG4gICAgbGV0IGNvbnRyb2xzOiBjb250ZXh0LkNvbnRleHR1YWxpemVkQ29udHJvbFtdID0gW107XG5cbiAgICAvLyBQcm9jZXNzIG91ciBkYXRhXG4gICAgZm9yIChsZXQgZiBvZiB0aGlzLmV4ZWN1dGlvbkZpbGVzKSB7XG4gICAgICBsZXQgZmMgPSBjb250ZXh0LmNvbnRleHR1YWxpemVFdmFsdWF0aW9uKGYuZXhlY3V0aW9uKTtcbiAgICAgIGxldCBzZmMgPSAoZmMgYXMgdW5rbm93bikgYXMgU291cmNlZENvbnRleHR1YWxpemVkRXZhbHVhdGlvbjtcbiAgICAgIHNmYy5mcm9tX2ZpbGUgPSBmO1xuICAgICAgZXhlY3V0aW9ucy5wdXNoKE9iamVjdC5mcmVlemUoc2ZjKSk7XG4gICAgICBwcm9maWxlcy5wdXNoKC4uLmZjLmNvbnRhaW5zKTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBmIG9mIHRoaXMucHJvZmlsZUZpbGVzKSB7XG4gICAgICBsZXQgZmMgPSBjb250ZXh0LmNvbnRleHR1YWxpemVQcm9maWxlKGYucHJvZmlsZSk7XG4gICAgICBsZXQgc2ZjID0gKGZjIGFzIHVua25vd24pIGFzIFNvdXJjZWRDb250ZXh0dWFsaXplZFByb2ZpbGU7XG4gICAgICBzZmMuZnJvbV9maWxlID0gZjtcbiAgICAgIHByb2ZpbGVzLnB1c2goT2JqZWN0LmZyZWV6ZShzZmMpKTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBwIG9mIHByb2ZpbGVzKSB7XG4gICAgICBjb250cm9scy5wdXNoKC4uLnAuY29udGFpbnMpO1xuICAgIH1cblxuICAgIHJldHVybiBbZXhlY3V0aW9ucywgcHJvZmlsZXMsIGNvbnRyb2xzXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmVhZG9ubHkgbGlzdCBvZiBhbGwgZXhlY3V0aW9ucyBjdXJyZW50bHkgaGVsZCBpbiB0aGUgZGF0YSBzdG9yZVxuICAgKiBpbmNsdWRpbmcgYXNzb2NpYXRlZCBjb250ZXh0XG4gICAqL1xuICBnZXQgY29udGV4dHVhbEV4ZWN1dGlvbnMoKTogcmVhZG9ubHkgU291cmNlZENvbnRleHR1YWxpemVkRXZhbHVhdGlvbltdIHtcbiAgICByZXR1cm4gdGhpcy5jb250ZXh0U3RvcmVbMF07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHJlYWRvbmx5IGxpc3Qgb2YgYWxsIHByb2ZpbGVzIGN1cnJlbnRseSBoZWxkIGluIHRoZSBkYXRhIHN0b3JlXG4gICAqIGluY2x1ZGluZyBhc3NvY2lhdGVkIGNvbnRleHRcbiAgICovXG4gIGdldCBjb250ZXh0dWFsUHJvZmlsZXMoKTogcmVhZG9ubHkgY29udGV4dC5Db250ZXh0dWFsaXplZFByb2ZpbGVbXSB7XG4gICAgcmV0dXJuIHRoaXMuY29udGV4dFN0b3JlWzFdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSByZWFkb25seSBsaXN0IG9mIGFsbCBjb250cm9scyBjdXJyZW50bHkgaGVsZCBpbiB0aGUgZGF0YSBzdG9yZVxuICAgKiBpbmNsdWRpbmcgYXNzb2NpYXRlZCBjb250ZXh0XG4gICAqL1xuICBnZXQgY29udGV4dHVhbENvbnRyb2xzKCk6IHJlYWRvbmx5IGNvbnRleHQuQ29udGV4dHVhbGl6ZWRDb250cm9sW10ge1xuICAgIHJldHVybiB0aGlzLmNvbnRleHRTdG9yZVsyXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgcHJvZmlsZSBmaWxlIHRvIHRoZSBzdG9yZS5cbiAgICogQHBhcmFtIG5ld1Byb2ZpbGUgVGhlIHByb2ZpbGUgdG8gYWRkXG4gICAqL1xuICBATXV0YXRpb25cbiAgYWRkUHJvZmlsZShuZXdQcm9maWxlOiBQcm9maWxlRmlsZSkge1xuICAgIHRoaXMucHJvZmlsZUZpbGVzLnB1c2gobmV3UHJvZmlsZSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBleGVjdXRpb24gZmlsZSB0byB0aGUgc3RvcmUuXG4gICAqIEBwYXJhbSBuZXdFeGVjdXRpb24gVGhlIGV4ZWN1dGlvbiB0byBhZGRcbiAgICovXG4gIEBNdXRhdGlvblxuICBhZGRFeGVjdXRpb24obmV3RXhlY3V0aW9uOiBFdmFsdWF0aW9uRmlsZSkge1xuICAgIHRoaXMuZXhlY3V0aW9uRmlsZXMucHVzaChuZXdFeGVjdXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVubG9hZHMgdGhlIGZpbGUgd2l0aCB0aGUgZ2l2ZW4gaWRcbiAgICovXG4gIEBNdXRhdGlvblxuICByZW1vdmVGaWxlKGZpbGVfaWQ6IEZpbGVJRCkge1xuICAgIHRoaXMucHJvZmlsZUZpbGVzID0gdGhpcy5wcm9maWxlRmlsZXMuZmlsdGVyKFxuICAgICAgcGYgPT4gcGYudW5pcXVlX2lkICE9PSBmaWxlX2lkXG4gICAgKTtcbiAgICB0aGlzLmV4ZWN1dGlvbkZpbGVzID0gdGhpcy5leGVjdXRpb25GaWxlcy5maWx0ZXIoXG4gICAgICBlZiA9PiBlZi51bmlxdWVfaWQgIT09IGZpbGVfaWRcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIGFsbCBzdG9yZWQgZGF0YS5cbiAgICovXG4gIEBNdXRhdGlvblxuICByZXNldCgpIHtcbiAgICB0aGlzLnByb2ZpbGVGaWxlcyA9IFtdO1xuICAgIHRoaXMuZXhlY3V0aW9uRmlsZXMgPSBbXTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJbnNwZWNEYXRhTW9kdWxlO1xuIl0sInZlcnNpb24iOjN9