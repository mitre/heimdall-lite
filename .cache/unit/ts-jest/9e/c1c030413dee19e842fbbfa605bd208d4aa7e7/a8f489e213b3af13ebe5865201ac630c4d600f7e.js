"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const vuex_module_decorators_1 = require("vuex-module-decorators");
const store_1 = tslib_1.__importDefault(require("@/store/store"));
let AppInfoModule = class AppInfoModule extends vuex_module_decorators_1.VuexModule {
    /** The app version */
    get version() {
        return process.env.PACKAGE_VERSION;
    }
    /** The app description */
    get description() {
        return process.env.DESCRIPTION;
    }
    /** The full app repository url, e.g. "https://github.com/mitre/heimdall-lite" */
    get repository() {
        return process.env.REPOSITORY;
    }
    /** The username/org part of the repo url, e.g. mitre */
    get repo_org() {
        return this.repository.split("/")[3];
    }
    /** The project name of the repo url, e.g. heimdall-lite */
    get repo_name() {
        return this.repository.split("/")[4];
    }
    /** The app license */
    get license() {
        return process.env.LICENSE;
    }
    /** The app changelog */
    get changelog() {
        return process.env.CHANGELOG;
    }
    /** The app branch/build */
    get branch() {
        return process.env.BRANCH;
    }
    /** The app open new issues */
    get issues() {
        return process.env.ISSUES;
    }
};
AppInfoModule = tslib_1.__decorate([
    vuex_module_decorators_1.Module({
        namespaced: true,
        dynamic: true,
        store: store_1.default,
        name: "info"
    })
], AppInfoModule);
exports.default = AppInfoModule;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL3Nqb3NoaS90ZXN0L2hlaW1kYWxsLWxpdGUvc3JjL3N0b3JlL2FwcF9pbmZvLnRzIiwibWFwcGluZ3MiOiI7OztBQUFBLG1FQUE0RDtBQUM1RCxrRUFBa0M7QUFxQmxDLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxtQ0FBVTtJQUNwQyxzQkFBc0I7SUFDdEIsSUFBSSxPQUFPO1FBQ1QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQztJQUNyQyxDQUFDO0lBRUQsMEJBQTBCO0lBQzFCLElBQUksV0FBVztRQUNiLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7SUFDakMsQ0FBQztJQUVELGlGQUFpRjtJQUNqRixJQUFJLFVBQVU7UUFDWixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO0lBQ2hDLENBQUM7SUFFRCx3REFBd0Q7SUFDeEQsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsMkRBQTJEO0lBQzNELElBQUksU0FBUztRQUNYLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELHNCQUFzQjtJQUN0QixJQUFJLE9BQU87UUFDVCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO0lBQzdCLENBQUM7SUFFRCx3QkFBd0I7SUFDeEIsSUFBSSxTQUFTO1FBQ1gsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztJQUMvQixDQUFDO0lBRUQsMkJBQTJCO0lBQzNCLElBQUksTUFBTTtRQUNSLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDNUIsQ0FBQztJQUVELDhCQUE4QjtJQUM5QixJQUFJLE1BQU07UUFDUixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQzVCLENBQUM7Q0FDRixDQUFBO0FBN0NLLGFBQWE7SUFObEIsK0JBQU0sQ0FBQztRQUNOLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLGVBQUs7UUFDWixJQUFJLEVBQUUsTUFBTTtLQUNiLENBQUM7R0FDSSxhQUFhLENBNkNsQjtBQUVELGtCQUFlLGFBQWEsQ0FBQyIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvc2pvc2hpL3Rlc3QvaGVpbWRhbGwtbGl0ZS9zcmMvc3RvcmUvYXBwX2luZm8udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTW9kdWxlLCBWdWV4TW9kdWxlIH0gZnJvbSBcInZ1ZXgtbW9kdWxlLWRlY29yYXRvcnNcIjtcbmltcG9ydCBTdG9yZSBmcm9tIFwiQC9zdG9yZS9zdG9yZVwiO1xuXG4vKiogQ29uZmlndXJlIHRoaXMgdG8gbWF0Y2ggZGF0YSBzZXQgaW4gdnVlLmNvbmZpZy50cyAqL1xuZGVjbGFyZSBjb25zdCBwcm9jZXNzOiB7XG4gIGVudjoge1xuICAgIFBBQ0tBR0VfVkVSU0lPTjogc3RyaW5nO1xuICAgIERFU0NSSVBUSU9OOiBzdHJpbmc7XG4gICAgUkVQT1NJVE9SWTogc3RyaW5nO1xuICAgIExJQ0VOU0U6IHN0cmluZztcbiAgICBDSEFOR0VMT0c6IHN0cmluZztcbiAgICBCUkFOQ0g6IHN0cmluZztcbiAgICBJU1NVRVM6IHN0cmluZztcbiAgfTtcbn07XG5cbkBNb2R1bGUoe1xuICBuYW1lc3BhY2VkOiB0cnVlLFxuICBkeW5hbWljOiB0cnVlLFxuICBzdG9yZTogU3RvcmUsXG4gIG5hbWU6IFwiaW5mb1wiXG59KVxuY2xhc3MgQXBwSW5mb01vZHVsZSBleHRlbmRzIFZ1ZXhNb2R1bGUge1xuICAvKiogVGhlIGFwcCB2ZXJzaW9uICovXG4gIGdldCB2ZXJzaW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LlBBQ0tBR0VfVkVSU0lPTjtcbiAgfVxuXG4gIC8qKiBUaGUgYXBwIGRlc2NyaXB0aW9uICovXG4gIGdldCBkZXNjcmlwdGlvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5ERVNDUklQVElPTjtcbiAgfVxuXG4gIC8qKiBUaGUgZnVsbCBhcHAgcmVwb3NpdG9yeSB1cmwsIGUuZy4gXCJodHRwczovL2dpdGh1Yi5jb20vbWl0cmUvaGVpbWRhbGwtbGl0ZVwiICovXG4gIGdldCByZXBvc2l0b3J5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LlJFUE9TSVRPUlk7XG4gIH1cblxuICAvKiogVGhlIHVzZXJuYW1lL29yZyBwYXJ0IG9mIHRoZSByZXBvIHVybCwgZS5nLiBtaXRyZSAqL1xuICBnZXQgcmVwb19vcmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5yZXBvc2l0b3J5LnNwbGl0KFwiL1wiKVszXTtcbiAgfVxuXG4gIC8qKiBUaGUgcHJvamVjdCBuYW1lIG9mIHRoZSByZXBvIHVybCwgZS5nLiBoZWltZGFsbC1saXRlICovXG4gIGdldCByZXBvX25hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5yZXBvc2l0b3J5LnNwbGl0KFwiL1wiKVs0XTtcbiAgfVxuXG4gIC8qKiBUaGUgYXBwIGxpY2Vuc2UgKi9cbiAgZ2V0IGxpY2Vuc2UoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnYuTElDRU5TRTtcbiAgfVxuXG4gIC8qKiBUaGUgYXBwIGNoYW5nZWxvZyAqL1xuICBnZXQgY2hhbmdlbG9nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LkNIQU5HRUxPRztcbiAgfVxuXG4gIC8qKiBUaGUgYXBwIGJyYW5jaC9idWlsZCAqL1xuICBnZXQgYnJhbmNoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LkJSQU5DSDtcbiAgfVxuXG4gIC8qKiBUaGUgYXBwIG9wZW4gbmV3IGlzc3VlcyAqL1xuICBnZXQgaXNzdWVzKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LklTU1VFUztcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBJbmZvTW9kdWxlO1xuIl0sInZlcnNpb24iOjN9