"use strict";
/**
 * Reads and parses inspec files
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inspecjs_1 = require("inspecjs");
const vuex_module_decorators_1 = require("vuex-module-decorators");
const data_store_1 = tslib_1.__importDefault(require("@/store/data_store"));
const store_1 = tslib_1.__importDefault(require("@/store/store"));
const async_util_1 = require("@/utilities/async_util");
let InspecIntakeModule = class InspecIntakeModule extends vuex_module_decorators_1.VuexModule {
    /**
     * Load a file with the specified options. Promises an error message on failure
     */
    async loadFile(options) {
        let read = async_util_1.read_file_async(options.file);
        return read
            .then(text => this.loadText({
            text,
            unique_id: options.unique_id,
            filename: options.file.name
        }))
            .then(err => {
            return err;
        });
    }
    /*
     * Due to issues with catching errors from Actions, this function returns its
     * errors. null implies the text load was successful.
     */
    async loadText(options) {
        console.log("Load Text: " + options.text);
        // Fetch our data store
        const data = vuex_module_decorators_1.getModule(data_store_1.default, store_1.default);
        // Convert it
        let result;
        try {
            result = inspecjs_1.parse.convertFile(options.text);
        }
        catch (e) {
            console.log(`Failed to convert file ${options.filename} due to error "${e}".`);
            return new Error(`Failed to convert file ${options.filename} due to error "${e}".`);
        }
        // Determine what sort of file we (hopefully) have, then add it
        if (result["1_0_ExecJson"]) {
            // Handle as exec
            console.log("is Execution");
            let execution = result["1_0_ExecJson"];
            execution = Object.freeze(execution);
            let reportFile = {
                unique_id: options.unique_id,
                filename: options.filename,
                execution
            };
            console.log("addExecution");
            data.addExecution(reportFile);
        }
        else if (result["1_0_ProfileJson"]) {
            // Handle as profile
            console.log("is Profile");
            let profile = result["1_0_ProfileJson"];
            let profileFile = {
                unique_id: options.unique_id,
                filename: options.filename,
                profile
            };
            console.log("addProfile");
            data.addProfile(profileFile);
        }
        else {
            console.log("is Nothing");
            return new Error("Couldn't parse data");
        }
        return null;
    }
};
tslib_1.__decorate([
    vuex_module_decorators_1.Action
], InspecIntakeModule.prototype, "loadFile", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Action
], InspecIntakeModule.prototype, "loadText", null);
InspecIntakeModule = tslib_1.__decorate([
    vuex_module_decorators_1.Module({
        namespaced: true,
        dynamic: true,
        store: store_1.default,
        name: "intake"
    })
], InspecIntakeModule);
exports.default = InspecIntakeModule;
// Track granted file ids
let last_granted_unique_id = 0;
/**
 * Yields a guaranteed currently free file ID.
 * This is the computed as the highest currently held file id + 1
 * It does not "fill spaces" of closed files, so that in any given
 * session we will never repeat a file ID with a different file object.
 */
function next_free_file_ID() {
    last_granted_unique_id += 1;
    return last_granted_unique_id;
}
exports.next_free_file_ID = next_free_file_ID;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL3Nqb3NoaS90ZXN0L2hlaW1kYWxsLWxpdGUvc3JjL3N0b3JlL3JlcG9ydF9pbnRha2UudHMiLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7QUFFSCx1Q0FBaUM7QUFDakMsbUVBQStFO0FBQy9FLDRFQUE0QztBQUM1QyxrRUFBa0M7QUFDbEMsdURBQXlEO0FBaUR6RCxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLG1DQUFVO0lBQ3pDOztPQUVHO0lBRUgsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUF3QjtRQUNyQyxJQUFJLElBQUksR0FBRyw0QkFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QyxPQUFPLElBQUk7YUFDUixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FDWCxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ1osSUFBSTtZQUNKLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUztZQUM1QixRQUFRLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJO1NBQzVCLENBQUMsQ0FDSDthQUNBLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNWLE9BQU8sR0FBRyxDQUFDO1FBQ2IsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7OztPQUdHO0lBRUgsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUF3QjtRQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUMsdUJBQXVCO1FBQ3ZCLE1BQU0sSUFBSSxHQUFHLGtDQUFTLENBQUMsb0JBQVUsRUFBRSxlQUFLLENBQUMsQ0FBQztRQUUxQyxhQUFhO1FBQ2IsSUFBSSxNQUE4QixDQUFDO1FBQ25DLElBQUk7WUFDRixNQUFNLEdBQUcsZ0JBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzFDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLENBQUMsR0FBRyxDQUNULDBCQUEwQixPQUFPLENBQUMsUUFBUSxrQkFBa0IsQ0FBQyxJQUFJLENBQ2xFLENBQUM7WUFDRixPQUFPLElBQUksS0FBSyxDQUNkLDBCQUEwQixPQUFPLENBQUMsUUFBUSxrQkFBa0IsQ0FBQyxJQUFJLENBQ2xFLENBQUM7U0FDSDtRQUVELCtEQUErRDtRQUMvRCxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUMxQixpQkFBaUI7WUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM1QixJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDdkMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckMsSUFBSSxVQUFVLEdBQUc7Z0JBQ2YsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO2dCQUM1QixRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7Z0JBQzFCLFNBQVM7YUFDVixDQUFDO1lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQy9CO2FBQU0sSUFBSSxNQUFNLENBQUMsaUJBQWlCLENBQUMsRUFBRTtZQUNwQyxvQkFBb0I7WUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMxQixJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN4QyxJQUFJLFdBQVcsR0FBRztnQkFDaEIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO2dCQUM1QixRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7Z0JBQzFCLE9BQU87YUFDUixDQUFDO1lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzlCO2FBQU07WUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFCLE9BQU8sSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztTQUN6QztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGLENBQUE7QUFwRUM7SUFEQywrQkFBTTtrREFjTjtBQU9EO0lBREMsK0JBQU07a0RBZ0ROO0FBeEVHLGtCQUFrQjtJQU52QiwrQkFBTSxDQUFDO1FBQ04sVUFBVSxFQUFFLElBQUk7UUFDaEIsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsZUFBSztRQUNaLElBQUksRUFBRSxRQUFRO0tBQ2YsQ0FBQztHQUNJLGtCQUFrQixDQXlFdkI7QUFFRCxrQkFBZSxrQkFBa0IsQ0FBQztBQUVsQyx5QkFBeUI7QUFDekIsSUFBSSxzQkFBc0IsR0FBVyxDQUFDLENBQUM7QUFFdkM7Ozs7O0dBS0c7QUFDSCxTQUFnQixpQkFBaUI7SUFDL0Isc0JBQXNCLElBQUksQ0FBQyxDQUFDO0lBQzVCLE9BQU8sc0JBQXNCLENBQUM7QUFDaEMsQ0FBQztBQUhELDhDQUdDIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9zam9zaGkvdGVzdC9oZWltZGFsbC1saXRlL3NyYy9zdG9yZS9yZXBvcnRfaW50YWtlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUmVhZHMgYW5kIHBhcnNlcyBpbnNwZWMgZmlsZXNcbiAqL1xuXG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gXCJpbnNwZWNqc1wiO1xuaW1wb3J0IHsgTW9kdWxlLCBWdWV4TW9kdWxlLCBnZXRNb2R1bGUsIEFjdGlvbiB9IGZyb20gXCJ2dWV4LW1vZHVsZS1kZWNvcmF0b3JzXCI7XG5pbXBvcnQgRGF0YU1vZHVsZSBmcm9tIFwiQC9zdG9yZS9kYXRhX3N0b3JlXCI7XG5pbXBvcnQgU3RvcmUgZnJvbSBcIkAvc3RvcmUvc3RvcmVcIjtcbmltcG9ydCB7IHJlYWRfZmlsZV9hc3luYyB9IGZyb20gXCJAL3V0aWxpdGllcy9hc3luY191dGlsXCI7XG5cbi8qKiBFYWNoIEZpbGVJRCBjb3JyZXNwb25kcyB0byBhIHVuaXF1ZSBGaWxlIGluIHRoaXMgc3RvcmUgKi9cbmV4cG9ydCB0eXBlIEZpbGVJRCA9IG51bWJlcjtcblxuLyoqIFJlcHJlc2VudHMgdGhlIG1pbmltdW0gZGF0YSB0byByZXByZXNlbnQgYW4gdXBsb2FkZWQgZmlsZSBoYW5kbGUuICovXG5leHBvcnQgdHlwZSBJbnNwZWNGaWxlID0ge1xuICAvKipcbiAgICogVW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoaXMgZmlsZS4gVXNlZCB0byBlbmNvZGUgd2hpY2ggZmlsZSBpcyBjdXJyZW50bHkgc2VsZWN0ZWQsIGV0Yy5cbiAgICpcbiAgICogTm90ZSB0aGF0IGluIGdlbmVyYWwgb25lIGNhbiBhc3N1bWUgdGhhdCBpZiBhIGZpbGUgQSBpcyBsb2FkZWQgQUZURVIgYSBmaWxlIEIsIHRoZW5cbiAgICogQS51bmlxdWVfaWQgPiBCLnVuaXF1ZV9pZC5cbiAgICogVXNpbmcgdGhpcyBwcm9wZXJ0eSwgb25lIG1pZ2h0IG9yZGVyIGZpbGVzIGJ5IG9yZGVyIGluIHdoaWNoIHRoZXkgd2VyZSBhZGRlZC5cbiAgICovXG4gIHVuaXF1ZV9pZDogRmlsZUlEO1xuICAvKiogVGhlIGZpbGVuYW1lIHRoYXQgdGhpcyBmaWxlIHdhcyB1cGxvYWRlZCB1bmRlci4gKi9cbiAgZmlsZW5hbWU6IHN0cmluZztcbn07XG5cbi8qKiBSZXByZXNlbnRzIGEgZmlsZSBjb250YWluaW5nIGFuIEluc3BlYyBFeGVjdXRpb24gb3V0cHV0ICovXG5leHBvcnQgdHlwZSBFdmFsdWF0aW9uRmlsZSA9IEluc3BlY0ZpbGUgJiB7IGV4ZWN1dGlvbjogcGFyc2UuQW55RXhlYyB9O1xuLyoqIFJlcHJlc2VudHMgYSBmaWxlIGNvbnRhaW5pbmcgYW4gSW5zcGVjIFByb2ZpbGUgKG5vdCBydW4pICovXG5leHBvcnQgdHlwZSBQcm9maWxlRmlsZSA9IEluc3BlY0ZpbGUgJiB7IHByb2ZpbGU6IHBhcnNlLkFueVByb2ZpbGUgfTtcblxuZXhwb3J0IHR5cGUgRmlsZUxvYWRPcHRpb25zID0ge1xuICAvKiogVGhlIGZpbGUgdG8gbG9hZCAqL1xuICBmaWxlOiBGaWxlO1xuXG4gIC8qKiBUaGUgdW5pcXVlIGlkIHRvIGdyYW50IGl0ICovXG4gIHVuaXF1ZV9pZDogRmlsZUlEO1xufTtcblxuZXhwb3J0IHR5cGUgVGV4dExvYWRPcHRpb25zID0ge1xuICAvKiogVGhlIGZpbGVuYW1lIHRvIGRlbm90ZSB0aGlzIG9iamVjdCB3aXRoICovXG4gIGZpbGVuYW1lOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSB1bmlxdWUgaWQgdG8gZ3JhbnQgaXQgKi9cbiAgdW5pcXVlX2lkOiBGaWxlSUQ7XG5cbiAgLyoqIFRoZSB0ZXh0IHRvIHVzZSBmb3IgaXQuICovXG4gIHRleHQ6IHN0cmluZztcbn07XG5cbkBNb2R1bGUoe1xuICBuYW1lc3BhY2VkOiB0cnVlLFxuICBkeW5hbWljOiB0cnVlLFxuICBzdG9yZTogU3RvcmUsXG4gIG5hbWU6IFwiaW50YWtlXCJcbn0pXG5jbGFzcyBJbnNwZWNJbnRha2VNb2R1bGUgZXh0ZW5kcyBWdWV4TW9kdWxlIHtcbiAgLyoqXG4gICAqIExvYWQgYSBmaWxlIHdpdGggdGhlIHNwZWNpZmllZCBvcHRpb25zLiBQcm9taXNlcyBhbiBlcnJvciBtZXNzYWdlIG9uIGZhaWx1cmVcbiAgICovXG4gIEBBY3Rpb25cbiAgYXN5bmMgbG9hZEZpbGUob3B0aW9uczogRmlsZUxvYWRPcHRpb25zKTogUHJvbWlzZTxFcnJvciB8IG51bGw+IHtcbiAgICBsZXQgcmVhZCA9IHJlYWRfZmlsZV9hc3luYyhvcHRpb25zLmZpbGUpO1xuICAgIHJldHVybiByZWFkXG4gICAgICAudGhlbih0ZXh0ID0+XG4gICAgICAgIHRoaXMubG9hZFRleHQoe1xuICAgICAgICAgIHRleHQsXG4gICAgICAgICAgdW5pcXVlX2lkOiBvcHRpb25zLnVuaXF1ZV9pZCxcbiAgICAgICAgICBmaWxlbmFtZTogb3B0aW9ucy5maWxlLm5hbWVcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIC50aGVuKGVyciA9PiB7XG4gICAgICAgIHJldHVybiBlcnI7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICAqIER1ZSB0byBpc3N1ZXMgd2l0aCBjYXRjaGluZyBlcnJvcnMgZnJvbSBBY3Rpb25zLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgaXRzXG4gICAqIGVycm9ycy4gbnVsbCBpbXBsaWVzIHRoZSB0ZXh0IGxvYWQgd2FzIHN1Y2Nlc3NmdWwuXG4gICAqL1xuICBAQWN0aW9uXG4gIGFzeW5jIGxvYWRUZXh0KG9wdGlvbnM6IFRleHRMb2FkT3B0aW9ucyk6IFByb21pc2U8RXJyb3IgfCBudWxsPiB7XG4gICAgY29uc29sZS5sb2coXCJMb2FkIFRleHQ6IFwiICsgb3B0aW9ucy50ZXh0KTtcbiAgICAvLyBGZXRjaCBvdXIgZGF0YSBzdG9yZVxuICAgIGNvbnN0IGRhdGEgPSBnZXRNb2R1bGUoRGF0YU1vZHVsZSwgU3RvcmUpO1xuXG4gICAgLy8gQ29udmVydCBpdFxuICAgIGxldCByZXN1bHQ6IHBhcnNlLkNvbnZlcnNpb25SZXN1bHQ7XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IHBhcnNlLmNvbnZlcnRGaWxlKG9wdGlvbnMudGV4dCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIGBGYWlsZWQgdG8gY29udmVydCBmaWxlICR7b3B0aW9ucy5maWxlbmFtZX0gZHVlIHRvIGVycm9yIFwiJHtlfVwiLmBcbiAgICAgICk7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKFxuICAgICAgICBgRmFpbGVkIHRvIGNvbnZlcnQgZmlsZSAke29wdGlvbnMuZmlsZW5hbWV9IGR1ZSB0byBlcnJvciBcIiR7ZX1cIi5gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIERldGVybWluZSB3aGF0IHNvcnQgb2YgZmlsZSB3ZSAoaG9wZWZ1bGx5KSBoYXZlLCB0aGVuIGFkZCBpdFxuICAgIGlmIChyZXN1bHRbXCIxXzBfRXhlY0pzb25cIl0pIHtcbiAgICAgIC8vIEhhbmRsZSBhcyBleGVjXG4gICAgICBjb25zb2xlLmxvZyhcImlzIEV4ZWN1dGlvblwiKTtcbiAgICAgIGxldCBleGVjdXRpb24gPSByZXN1bHRbXCIxXzBfRXhlY0pzb25cIl07XG4gICAgICBleGVjdXRpb24gPSBPYmplY3QuZnJlZXplKGV4ZWN1dGlvbik7XG4gICAgICBsZXQgcmVwb3J0RmlsZSA9IHtcbiAgICAgICAgdW5pcXVlX2lkOiBvcHRpb25zLnVuaXF1ZV9pZCxcbiAgICAgICAgZmlsZW5hbWU6IG9wdGlvbnMuZmlsZW5hbWUsXG4gICAgICAgIGV4ZWN1dGlvblxuICAgICAgfTtcbiAgICAgIGNvbnNvbGUubG9nKFwiYWRkRXhlY3V0aW9uXCIpO1xuICAgICAgZGF0YS5hZGRFeGVjdXRpb24ocmVwb3J0RmlsZSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHRbXCIxXzBfUHJvZmlsZUpzb25cIl0pIHtcbiAgICAgIC8vIEhhbmRsZSBhcyBwcm9maWxlXG4gICAgICBjb25zb2xlLmxvZyhcImlzIFByb2ZpbGVcIik7XG4gICAgICBsZXQgcHJvZmlsZSA9IHJlc3VsdFtcIjFfMF9Qcm9maWxlSnNvblwiXTtcbiAgICAgIGxldCBwcm9maWxlRmlsZSA9IHtcbiAgICAgICAgdW5pcXVlX2lkOiBvcHRpb25zLnVuaXF1ZV9pZCxcbiAgICAgICAgZmlsZW5hbWU6IG9wdGlvbnMuZmlsZW5hbWUsXG4gICAgICAgIHByb2ZpbGVcbiAgICAgIH07XG4gICAgICBjb25zb2xlLmxvZyhcImFkZFByb2ZpbGVcIik7XG4gICAgICBkYXRhLmFkZFByb2ZpbGUocHJvZmlsZUZpbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImlzIE5vdGhpbmdcIik7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKFwiQ291bGRuJ3QgcGFyc2UgZGF0YVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSW5zcGVjSW50YWtlTW9kdWxlO1xuXG4vLyBUcmFjayBncmFudGVkIGZpbGUgaWRzXG5sZXQgbGFzdF9ncmFudGVkX3VuaXF1ZV9pZDogbnVtYmVyID0gMDtcblxuLyoqXG4gKiBZaWVsZHMgYSBndWFyYW50ZWVkIGN1cnJlbnRseSBmcmVlIGZpbGUgSUQuXG4gKiBUaGlzIGlzIHRoZSBjb21wdXRlZCBhcyB0aGUgaGlnaGVzdCBjdXJyZW50bHkgaGVsZCBmaWxlIGlkICsgMVxuICogSXQgZG9lcyBub3QgXCJmaWxsIHNwYWNlc1wiIG9mIGNsb3NlZCBmaWxlcywgc28gdGhhdCBpbiBhbnkgZ2l2ZW5cbiAqIHNlc3Npb24gd2Ugd2lsbCBuZXZlciByZXBlYXQgYSBmaWxlIElEIHdpdGggYSBkaWZmZXJlbnQgZmlsZSBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZXh0X2ZyZWVfZmlsZV9JRCgpOiBGaWxlSUQge1xuICBsYXN0X2dyYW50ZWRfdW5pcXVlX2lkICs9IDE7XG4gIHJldHVybiBsYXN0X2dyYW50ZWRfdW5pcXVlX2lkO1xufVxuIl0sInZlcnNpb24iOjN9