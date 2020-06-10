"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const vuex_module_decorators_1 = require("vuex-module-decorators");
const store_1 = tslib_1.__importDefault(require("@/store/store"));
const helper_util_1 = require("@/utilities/helper_util");
const axios_1 = tslib_1.__importDefault(require("axios"));
const class_transformer_1 = require("class-transformer");
/** The body of a registration Request */
//"id":1,"first_name":null,"last_name":null,"email":"email@gmail.com","image":null,"phone_number":null,"createdAt":"2020-03-23T15:57:33.044Z","updatedAt":"2020-03-23T15:57:33.044Z"}
class UserProfile {
}
exports.UserProfile = UserProfile;
const local_token = new helper_util_1.LocalStorageVal("auth_token");
const local_user = new helper_util_1.LocalStorageVal("user_profile");
const local_user_evaluations = new helper_util_1.LocalStorageVal("user_evaluations");
const local_evaluation = new helper_util_1.LocalStorageVal("evaluation");
class ConnectionError extends Error {
    constructor(type, message) {
        super(`${type} - ${message}`);
        this.type = type;
        this.message = message;
    }
}
exports.ConnectionError = ConnectionError;
class HSConnectionConfig {
    constructor(url) {
        this.url = url;
    }
    /** Checks whether the connection works. If it succeeds, then assume all is well */
    async check() {
        return fetch(this.url, { method: "get" })
            .then(response => response.text())
            .then(text => {
            if (text != "HS_ALIVE") {
                throw new ConnectionError("BAD_CONNECTION", "Connection failed");
            }
        });
    }
}
exports.HSConnectionConfig = HSConnectionConfig;
let HeimdallServerModule = class HeimdallServerModule extends vuex_module_decorators_1.VuexModule {
    constructor() {
        super(...arguments);
        /** Our current target server parameters */
        this.connection = null;
        this.serverMode = null;
        this.serverUrl = "";
        /** Our currently granted JWT token */
        this.token = local_token.get();
        this.profile = local_user.get();
        this.user_evaluations = local_user_evaluations.get();
        this.evaluation = local_evaluation.get();
    }
    set_connection(new_url) {
        this.connection = new HSConnectionConfig(new_url);
    }
    async connect(new_url) {
        console.log("connected :" + new_url);
        this.set_connection(new_url);
    }
    /** Mutation to set above, as well as to update our localstorage */
    set_token(new_token) {
        this.token = new_token;
        console.log("server.ts - set token: " + this.token);
        local_token.set(new_token);
    }
    mod_server_url(value) {
        this.serverUrl = value;
    }
    mod_server_mode(value) {
        this.serverMode = value;
    }
    server_mode() {
        let url = window.location.origin + "/api";
        console.log(url);
        /*This will check if api is available */
        if (process.env.VUE_APP_API_URL) {
            this.mod_server_url(process.env.VUE_APP_API_URL); // this.serverUrl = process.env.VUE_APP_API_URL;
            this.mod_server_mode(true);
        }
        else {
            axios_1.default
                .get(url, {
                validateStatus: function (status) {
                    return status < 500; // Reject only if the status code is greater than or equal to 500
                }
            })
                .then(res => {
                console.log("test");
                if (res.status == 200) {
                    this.mod_server_mode(true); //window.location.href;
                    this.mod_server_url(url); // = true;
                }
                else {
                    this.mod_server_mode(false);
                }
            })
                .catch(error => {
                console.log("caught error");
                this.mod_server_mode(false);
            });
        }
    }
    set_server_url(url) {
        this.serverUrl = url;
    }
    /** Mutation to set above, as well as to update our localstorage */
    set_evaluation(evaluation) {
        this.evaluation = evaluation;
        console.log("server.ts - set evaluation: " + this.evaluation);
        local_evaluation.set(evaluation);
    }
    /* Actions to authorize and set token */
    clear_token() {
        this.set_token(null);
        this.set_user_profile(null);
        this.set_user_evaluations(null);
    }
    /** Mutation to set user_profile, as well as to update our localstorage */
    set_user_profile(new_user) {
        if (new_user) {
            this.profile = class_transformer_1.plainToClass(UserProfile, new_user);
        }
        else {
            this.profile = null;
        }
        console.log("server.ts - set user: " + this.profile);
        local_user.set(this.profile);
    }
    /** Mutation to set user_profile, as well as to update our localstorage */
    set_user_evaluations(evals) {
        if (evals) {
            this.user_evaluations = evals;
        }
        else {
            this.user_evaluations = null;
        }
        console.log("server.ts - set user_evaluations: " + this.user_evaluations);
        local_user_evaluations.set(this.user_evaluations);
    }
    /** Attempts to login to the server */
    async login(creds) {
        console.log("Logging in to " +
            this.connection.url +
            "/auth/login" +
            " with " +
            creds["username"] +
            "/" +
            creds["password"]);
        //this.requires_connection();
        console.log("has connection");
        //curl -X POST http://localhost:8050/auth/login -d '{"username": "blah", "password": "blaah"}' -H "Content-Type: application/json"
        return fetch(this.connection.url + "/auth/login", {
            body: `{"username": "${creds["username"]}", "password": "${creds["password"]}"}`,
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST"
        })
            .then(this.check_code)
            .then(res => res.json())
            .then((v) => {
            if (typeof v === "object") {
                this.set_token(v.access_token);
                console.log("got token" + v.access_token);
                this.retrieve_profile();
                this.retrieve_personal_evaluations();
            }
            else {
                console.error(`Something went wrong: Got ${v.access_token} for login response`);
                throw new ConnectionError("BAD_RESPONSE", "Got unrecognized login response");
            }
        });
    }
    /** Attempts to login to the server */
    async register(creds) {
        console.log("Registering to " +
            this.connection.url +
            "/auth/register" +
            " with " +
            creds["username"] +
            "/" +
            creds["password"]);
        //curl -X POST http://localhost:8050/auth/register -d '{"email": "blah@gmail.com", "password": "blaah"}' -H "Content-Type: application/json"
        return (fetch(this.connection.url + "/auth/register", {
            body: `{"email": "${creds["username"]}", "password": "${creds["password"]}"}`,
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST"
        })
            //.then(this.check_code)
            //.then(res => res.json())
            .then((v) => {
            if (v.ok) {
                console.log("registration returned " + v.ok);
            }
            else {
                console.error(`Something went wrong: Got ${JSON.stringify(v)} for register response`);
                throw new ConnectionError("BAD_RESPONSE", "Got unrecognized register response");
            }
        }));
    }
    /** Attempts to login to the server */
    async retrieve_profile() {
        console.log("Getting " + this.connection.url + "/auth/profile");
        //curl http://localhost:8050/auth/profile -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."
        return axios_1.default
            .get(this.connection.url + "/auth/profile", {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        })
            .then((v) => {
            this.set_user_profile(v.data);
        });
    }
    /** Attempts to save evaluation to the database */
    async save_evaluation(evaluation) {
        console.log("Saving execution to " + this.connection.url + "/executions/upload");
        const options = {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        };
        return axios_1.default
            .post(this.connection.url + "/executions/upload", {
            evaluation: evaluation.execution,
            filename: evaluation.filename
        }, options)
            .then((v) => {
            console.log("saved");
        });
    }
    /** Attempts to retrieve a list of personal evaluations */
    async retrieve_personal_evaluations() {
        console.log("Getting " + this.connection.url + "/executions/personal");
        //curl http://localhost:8050/executions/personal -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."
        return axios_1.default
            .get(this.connection.url + "/executions/personal", {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        })
            .then((v) => {
            console.log("personal evals: " + JSON.stringify(v.data));
            this.set_user_evaluations(v.data);
        });
    }
    /** Attempts to retrieve a list of personal evaluations */
    async retrieve_evaluation(file_id) {
        console.log("Getting " + this.connection.url + "/executions/fetch/" + file_id);
        //curl http://localhost:8050/executions/personal -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."
        return axios_1.default
            .get(this.connection.url + "/executions/fetch/" + file_id, {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        })
            .then((v) => {
            console.log("got evaluation: " + JSON.stringify(v.data));
            this.set_evaluation(v.data);
        });
    }
    /** Our supposed role */
    // TODO:
    async check_code(res) {
        // if ok, pass
        console.log("check_code res.ok: " + res.ok);
        if (res.ok) {
            console.log("check_code res.status: " + res.status);
            console.log("check_code res.body: " + res.body);
            return res;
        }
        switch (res.status) {
            case 401:
                throw new ConnectionError("UNAUTHORIZED", res.statusText);
            default:
                throw new ConnectionError("UNKNOWN", res.statusText);
        }
    }
};
tslib_1.__decorate([
    vuex_module_decorators_1.Mutation
], HeimdallServerModule.prototype, "set_connection", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Action
], HeimdallServerModule.prototype, "connect", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Mutation
], HeimdallServerModule.prototype, "set_token", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Mutation
], HeimdallServerModule.prototype, "mod_server_url", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Mutation
], HeimdallServerModule.prototype, "mod_server_mode", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Action
], HeimdallServerModule.prototype, "server_mode", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Mutation
], HeimdallServerModule.prototype, "set_server_url", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Mutation
], HeimdallServerModule.prototype, "set_evaluation", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Action
], HeimdallServerModule.prototype, "clear_token", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Mutation
], HeimdallServerModule.prototype, "set_user_profile", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Mutation
], HeimdallServerModule.prototype, "set_user_evaluations", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Action
], HeimdallServerModule.prototype, "login", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Action
], HeimdallServerModule.prototype, "register", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Action
], HeimdallServerModule.prototype, "retrieve_profile", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Action
], HeimdallServerModule.prototype, "save_evaluation", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Action
], HeimdallServerModule.prototype, "retrieve_personal_evaluations", null);
tslib_1.__decorate([
    vuex_module_decorators_1.Action
], HeimdallServerModule.prototype, "retrieve_evaluation", null);
HeimdallServerModule = tslib_1.__decorate([
    vuex_module_decorators_1.Module({
        namespaced: true,
        dynamic: true,
        store: store_1.default,
        name: "heimdallServer"
    })
], HeimdallServerModule);
exports.default = HeimdallServerModule;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL3Nqb3NoaS90ZXN0L2hlaW1kYWxsLWxpdGUvc3JjL3N0b3JlL3NlcnZlci50cyIsIm1hcHBpbmdzIjoiOzs7QUFBQSxtRUFNZ0M7QUFDaEMsa0VBQWtDO0FBQ2xDLHlEQUEwRDtBQUMxRCwwREFBZ0Y7QUFDaEYseURBQWlEO0FBT2pELHlDQUF5QztBQUN6QyxxTEFBcUw7QUFDckwsTUFBYSxXQUFXO0NBU3ZCO0FBVEQsa0NBU0M7QUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLDZCQUFlLENBQWdCLFlBQVksQ0FBQyxDQUFDO0FBQ3JFLE1BQU0sVUFBVSxHQUFHLElBQUksNkJBQWUsQ0FBcUIsY0FBYyxDQUFDLENBQUM7QUFDM0UsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLDZCQUFlLENBQ2hELGtCQUFrQixDQUNuQixDQUFDO0FBQ0YsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLDZCQUFlLENBQWdCLFlBQVksQ0FBQyxDQUFDO0FBUzFFLE1BQWEsZUFBZ0IsU0FBUSxLQUFLO0lBQ3hDLFlBQXFCLElBQW1CLEVBQVcsT0FBZTtRQUNoRSxLQUFLLENBQUMsR0FBRyxJQUFJLE1BQU0sT0FBTyxFQUFFLENBQUMsQ0FBQztRQURYLFNBQUksR0FBSixJQUFJLENBQWU7UUFBVyxZQUFPLEdBQVAsT0FBTyxDQUFRO0lBRWxFLENBQUM7Q0FDRjtBQUpELDBDQUlDO0FBRUQsTUFBYSxrQkFBa0I7SUFDN0IsWUFBcUIsR0FBVztRQUFYLFFBQUcsR0FBSCxHQUFHLENBQVE7SUFBRyxDQUFDO0lBRXBDLG1GQUFtRjtJQUNuRixLQUFLLENBQUMsS0FBSztRQUNULE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUM7YUFDdEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNYLElBQUksSUFBSSxJQUFJLFVBQVUsRUFBRTtnQkFD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QVE7NERBU1I7QUFJRDtJQURDLGlDQUFRO2dFQVNSO0FBSUQ7SUFEQywrQkFBTTtpREF1Q047QUFJRDtJQURDLCtCQUFNO29EQXNDTjtBQUlEO0lBREMsK0JBQU07NERBYU47QUFJRDtJQURDLCtCQUFNOzJEQXNCTjtBQUlEO0lBREMsK0JBQU07eUVBY047QUFJRDtJQURDLCtCQUFNOytEQWdCTjtBQWpSRyxvQkFBb0I7SUFOekIsK0JBQU0sQ0FBQztRQUNOLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLGVBQUs7UUFDWixJQUFJLEVBQUUsZ0JBQWdCO0tBQ3ZCLENBQUM7R0FDSSxvQkFBb0IsQ0FzU3pCO0FBRUQsa0JBQWUsb0JBQW9CLENBQUMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL3Nqb3NoaS90ZXN0L2hlaW1kYWxsLWxpdGUvc3JjL3N0b3JlL3NlcnZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBNb2R1bGUsXG4gIFZ1ZXhNb2R1bGUsXG4gIGdldE1vZHVsZSxcbiAgTXV0YXRpb24sXG4gIEFjdGlvblxufSBmcm9tIFwidnVleC1tb2R1bGUtZGVjb3JhdG9yc1wiO1xuaW1wb3J0IFN0b3JlIGZyb20gXCJAL3N0b3JlL3N0b3JlXCI7XG5pbXBvcnQgeyBMb2NhbFN0b3JhZ2VWYWwgfSBmcm9tIFwiQC91dGlsaXRpZXMvaGVscGVyX3V0aWxcIjtcbmltcG9ydCBheGlvcywgeyBBeGlvc0luc3RhbmNlLCBBeGlvc1JlcXVlc3RDb25maWcsIEF4aW9zUmVzcG9uc2UgfSBmcm9tIFwiYXhpb3NcIjtcbmltcG9ydCB7IHBsYWluVG9DbGFzcyB9IGZyb20gXCJjbGFzcy10cmFuc2Zvcm1lclwiO1xuaW1wb3J0IHsgRXZhbHVhdGlvbkZpbGUsIFByb2ZpbGVGaWxlLCBGaWxlSUQgfSBmcm9tIFwiQC9zdG9yZS9yZXBvcnRfaW50YWtlXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9naW5IYXNoIHtcbiAgdXNlcm5hbWU6IHN0cmluZztcbiAgcGFzc3dvcmQ6IHN0cmluZztcbn1cbi8qKiBUaGUgYm9keSBvZiBhIHJlZ2lzdHJhdGlvbiBSZXF1ZXN0ICovXG4vL1wiaWRcIjoxLFwiZmlyc3RfbmFtZVwiOm51bGwsXCJsYXN0X25hbWVcIjpudWxsLFwiZW1haWxcIjpcImVtYWlsQGdtYWlsLmNvbVwiLFwiaW1hZ2VcIjpudWxsLFwicGhvbmVfbnVtYmVyXCI6bnVsbCxcImNyZWF0ZWRBdFwiOlwiMjAyMC0wMy0yM1QxNTo1NzozMy4wNDRaXCIsXCJ1cGRhdGVkQXRcIjpcIjIwMjAtMDMtMjNUMTU6NTc6MzMuMDQ0WlwifVxuZXhwb3J0IGNsYXNzIFVzZXJQcm9maWxlIHtcbiAgaWQhOiBudW1iZXI7XG4gIGZpcnN0X25hbWUhOiBzdHJpbmc7XG4gIGxhc3RfbmFtZSE6IHN0cmluZztcbiAgZW1haWwhOiBzdHJpbmc7XG4gIGltYWdlITogc3RyaW5nO1xuICBwaG9uZV9udW1iZXIhOiBzdHJpbmc7XG4gIGNyZWF0ZWRBdCE6IERhdGU7XG4gIHVwZGF0ZWRBdCE6IERhdGU7XG59XG5cbmNvbnN0IGxvY2FsX3Rva2VuID0gbmV3IExvY2FsU3RvcmFnZVZhbDxzdHJpbmcgfCBudWxsPihcImF1dGhfdG9rZW5cIik7XG5jb25zdCBsb2NhbF91c2VyID0gbmV3IExvY2FsU3RvcmFnZVZhbDxVc2VyUHJvZmlsZSB8IG51bGw+KFwidXNlcl9wcm9maWxlXCIpO1xuY29uc3QgbG9jYWxfdXNlcl9ldmFsdWF0aW9ucyA9IG5ldyBMb2NhbFN0b3JhZ2VWYWw8c3RyaW5nIHwgbnVsbD4oXG4gIFwidXNlcl9ldmFsdWF0aW9uc1wiXG4pO1xuY29uc3QgbG9jYWxfZXZhbHVhdGlvbiA9IG5ldyBMb2NhbFN0b3JhZ2VWYWw8c3RyaW5nIHwgbnVsbD4oXCJldmFsdWF0aW9uXCIpO1xuXG50eXBlIENvbm5FcnJvclR5cGUgPVxuICB8IFwiTk9fQ09OTkVDVElPTlwiXG4gIHwgXCJCQURfQ09OTkVDVElPTlwiXG4gIHwgXCJCQURfTE9HSU5cIlxuICB8IFwiVU5BVVRIT1JJWkVEXCJcbiAgfCBcIkJBRF9SRVNQT05TRVwiXG4gIHwgXCJVTktOT1dOXCI7XG5leHBvcnQgY2xhc3MgQ29ubmVjdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihyZWFkb25seSB0eXBlOiBDb25uRXJyb3JUeXBlLCByZWFkb25seSBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgJHt0eXBlfSAtICR7bWVzc2FnZX1gKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSFNDb25uZWN0aW9uQ29uZmlnIHtcbiAgY29uc3RydWN0b3IocmVhZG9ubHkgdXJsOiBzdHJpbmcpIHt9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBjb25uZWN0aW9uIHdvcmtzLiBJZiBpdCBzdWNjZWVkcywgdGhlbiBhc3N1bWUgYWxsIGlzIHdlbGwgKi9cbiAgYXN5bmMgY2hlY2soKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIGZldGNoKHRoaXMudXJsLCB7IG1ldGhvZDogXCJnZXRcIiB9KVxuICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UudGV4dCgpKVxuICAgICAgLnRoZW4odGV4dCA9PiB7XG4gICAgICAgIGlmICh0ZXh0ICE9IFwiSFNfQUxJVkVcIikge1xuICAgICAgICAgIHRocm93IG5ldyBDb25uZWN0aW9uRXJyb3IoXCJCQURfQ09OTkVDVElPTlwiLCBcIkNvbm5lY3Rpb24gZmFpbGVkXCIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxufVxuXG5ATW9kdWxlKHtcbiAgbmFtZXNwYWNlZDogdHJ1ZSxcbiAgZHluYW1pYzogdHJ1ZSxcbiAgc3RvcmU6IFN0b3JlLFxuICBuYW1lOiBcImhlaW1kYWxsU2VydmVyXCJcbn0pXG5jbGFzcyBIZWltZGFsbFNlcnZlck1vZHVsZSBleHRlbmRzIFZ1ZXhNb2R1bGUge1xuICAvKiogT3VyIGN1cnJlbnQgdGFyZ2V0IHNlcnZlciBwYXJhbWV0ZXJzICovXG4gIGNvbm5lY3Rpb246IEhTQ29ubmVjdGlvbkNvbmZpZyB8IG51bGwgPSBudWxsO1xuICBzZXJ2ZXJNb2RlOiBib29sZWFuIHwgbnVsbCA9IG51bGw7XG4gIHNlcnZlclVybDogc3RyaW5nID0gXCJcIjtcbiAgQE11dGF0aW9uXG4gIHNldF9jb25uZWN0aW9uKG5ld191cmw6IHN0cmluZykge1xuICAgIHRoaXMuY29ubmVjdGlvbiA9IG5ldyBIU0Nvbm5lY3Rpb25Db25maWcobmV3X3VybCk7XG4gIH1cblxuICBAQWN0aW9uXG4gIGFzeW5jIGNvbm5lY3QobmV3X3VybDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc29sZS5sb2coXCJjb25uZWN0ZWQgOlwiICsgbmV3X3VybCk7XG4gICAgdGhpcy5zZXRfY29ubmVjdGlvbihuZXdfdXJsKTtcbiAgfVxuXG4gIC8qKiBPdXIgY3VycmVudGx5IGdyYW50ZWQgSldUIHRva2VuICovXG4gIHRva2VuOiBzdHJpbmcgfCBudWxsID0gbG9jYWxfdG9rZW4uZ2V0KCk7XG4gIHByb2ZpbGU6IFVzZXJQcm9maWxlIHwgbnVsbCA9IGxvY2FsX3VzZXIuZ2V0KCk7XG4gIHVzZXJfZXZhbHVhdGlvbnM6IHN0cmluZyB8IG51bGwgPSBsb2NhbF91c2VyX2V2YWx1YXRpb25zLmdldCgpO1xuICBldmFsdWF0aW9uOiBzdHJpbmcgfCBudWxsID0gbG9jYWxfZXZhbHVhdGlvbi5nZXQoKTtcblxuICAvKiogTXV0YXRpb24gdG8gc2V0IGFib3ZlLCBhcyB3ZWxsIGFzIHRvIHVwZGF0ZSBvdXIgbG9jYWxzdG9yYWdlICovXG4gIEBNdXRhdGlvblxuICBzZXRfdG9rZW4obmV3X3Rva2VuOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgdGhpcy50b2tlbiA9IG5ld190b2tlbjtcbiAgICBjb25zb2xlLmxvZyhcInNlcnZlci50cyAtIHNldCB0b2tlbjogXCIgKyB0aGlzLnRva2VuKTtcbiAgICBsb2NhbF90b2tlbi5zZXQobmV3X3Rva2VuKTtcbiAgfVxuICBATXV0YXRpb25cbiAgbW9kX3NlcnZlcl91cmwodmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuc2VydmVyVXJsID0gdmFsdWU7XG4gIH1cblxuICBATXV0YXRpb25cbiAgbW9kX3NlcnZlcl9tb2RlKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5zZXJ2ZXJNb2RlID0gdmFsdWU7XG4gIH1cblxuICBAQWN0aW9uXG4gIHNlcnZlcl9tb2RlKCkge1xuICAgIGxldCB1cmwgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgXCIvYXBpXCI7XG4gICAgY29uc29sZS5sb2codXJsKTtcbiAgICAvKlRoaXMgd2lsbCBjaGVjayBpZiBhcGkgaXMgYXZhaWxhYmxlICovXG4gICAgaWYgKHByb2Nlc3MuZW52LlZVRV9BUFBfQVBJX1VSTCkge1xuICAgICAgdGhpcy5tb2Rfc2VydmVyX3VybChwcm9jZXNzLmVudi5WVUVfQVBQX0FQSV9VUkwpOyAvLyB0aGlzLnNlcnZlclVybCA9IHByb2Nlc3MuZW52LlZVRV9BUFBfQVBJX1VSTDtcbiAgICAgIHRoaXMubW9kX3NlcnZlcl9tb2RlKHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBheGlvc1xuICAgICAgICAuZ2V0KHVybCwge1xuICAgICAgICAgIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbihzdGF0dXMpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGF0dXMgPCA1MDA7IC8vIFJlamVjdCBvbmx5IGlmIHRoZSBzdGF0dXMgY29kZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gNTAwXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwidGVzdFwiKTtcbiAgICAgICAgICBpZiAocmVzLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgICAgIHRoaXMubW9kX3NlcnZlcl9tb2RlKHRydWUpOyAvL3dpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICAgICAgdGhpcy5tb2Rfc2VydmVyX3VybCh1cmwpOyAvLyA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubW9kX3NlcnZlcl9tb2RlKGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJjYXVnaHQgZXJyb3JcIik7XG4gICAgICAgICAgdGhpcy5tb2Rfc2VydmVyX21vZGUoZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBATXV0YXRpb25cbiAgc2V0X3NlcnZlcl91cmwodXJsOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNlcnZlclVybCA9IHVybDtcbiAgfVxuXG4gIC8qKiBNdXRhdGlvbiB0byBzZXQgYWJvdmUsIGFzIHdlbGwgYXMgdG8gdXBkYXRlIG91ciBsb2NhbHN0b3JhZ2UgKi9cbiAgQE11dGF0aW9uXG4gIHNldF9ldmFsdWF0aW9uKGV2YWx1YXRpb246IHN0cmluZyB8IG51bGwpIHtcbiAgICB0aGlzLmV2YWx1YXRpb24gPSBldmFsdWF0aW9uO1xuICAgIGNvbnNvbGUubG9nKFwic2VydmVyLnRzIC0gc2V0IGV2YWx1YXRpb246IFwiICsgdGhpcy5ldmFsdWF0aW9uKTtcbiAgICBsb2NhbF9ldmFsdWF0aW9uLnNldChldmFsdWF0aW9uKTtcbiAgfVxuXG4gIC8qIEFjdGlvbnMgdG8gYXV0aG9yaXplIGFuZCBzZXQgdG9rZW4gKi9cbiAgQEFjdGlvblxuICBjbGVhcl90b2tlbigpIHtcbiAgICB0aGlzLnNldF90b2tlbihudWxsKTtcbiAgICB0aGlzLnNldF91c2VyX3Byb2ZpbGUobnVsbCk7XG4gICAgdGhpcy5zZXRfdXNlcl9ldmFsdWF0aW9ucyhudWxsKTtcbiAgfVxuXG4gIC8qKiBNdXRhdGlvbiB0byBzZXQgdXNlcl9wcm9maWxlLCBhcyB3ZWxsIGFzIHRvIHVwZGF0ZSBvdXIgbG9jYWxzdG9yYWdlICovXG4gIEBNdXRhdGlvblxuICBzZXRfdXNlcl9wcm9maWxlKG5ld191c2VyOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgaWYgKG5ld191c2VyKSB7XG4gICAgICB0aGlzLnByb2ZpbGUgPSBwbGFpblRvQ2xhc3MoVXNlclByb2ZpbGUsIG5ld191c2VyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9maWxlID0gbnVsbDtcbiAgICB9XG4gICAgY29uc29sZS5sb2coXCJzZXJ2ZXIudHMgLSBzZXQgdXNlcjogXCIgKyB0aGlzLnByb2ZpbGUpO1xuICAgIGxvY2FsX3VzZXIuc2V0KHRoaXMucHJvZmlsZSk7XG4gIH1cblxuICAvKiogTXV0YXRpb24gdG8gc2V0IHVzZXJfcHJvZmlsZSwgYXMgd2VsbCBhcyB0byB1cGRhdGUgb3VyIGxvY2Fsc3RvcmFnZSAqL1xuICBATXV0YXRpb25cbiAgc2V0X3VzZXJfZXZhbHVhdGlvbnMoZXZhbHM6IHN0cmluZyB8IG51bGwpIHtcbiAgICBpZiAoZXZhbHMpIHtcbiAgICAgIHRoaXMudXNlcl9ldmFsdWF0aW9ucyA9IGV2YWxzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVzZXJfZXZhbHVhdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhcInNlcnZlci50cyAtIHNldCB1c2VyX2V2YWx1YXRpb25zOiBcIiArIHRoaXMudXNlcl9ldmFsdWF0aW9ucyk7XG4gICAgbG9jYWxfdXNlcl9ldmFsdWF0aW9ucy5zZXQodGhpcy51c2VyX2V2YWx1YXRpb25zKTtcbiAgfVxuXG4gIC8qKiBBdHRlbXB0cyB0byBsb2dpbiB0byB0aGUgc2VydmVyICovXG4gIEBBY3Rpb25cbiAgYXN5bmMgbG9naW4oY3JlZHM6IExvZ2luSGFzaCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgXCJMb2dnaW5nIGluIHRvIFwiICtcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uIS51cmwgK1xuICAgICAgICBcIi9hdXRoL2xvZ2luXCIgK1xuICAgICAgICBcIiB3aXRoIFwiICtcbiAgICAgICAgY3JlZHNbXCJ1c2VybmFtZVwiXSArXG4gICAgICAgIFwiL1wiICtcbiAgICAgICAgY3JlZHNbXCJwYXNzd29yZFwiXVxuICAgICk7XG4gICAgLy90aGlzLnJlcXVpcmVzX2Nvbm5lY3Rpb24oKTtcbiAgICBjb25zb2xlLmxvZyhcImhhcyBjb25uZWN0aW9uXCIpO1xuICAgIC8vY3VybCAtWCBQT1NUIGh0dHA6Ly9sb2NhbGhvc3Q6ODA1MC9hdXRoL2xvZ2luIC1kICd7XCJ1c2VybmFtZVwiOiBcImJsYWhcIiwgXCJwYXNzd29yZFwiOiBcImJsYWFoXCJ9JyAtSCBcIkNvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblwiXG4gICAgcmV0dXJuIGZldGNoKHRoaXMuY29ubmVjdGlvbiEudXJsICsgXCIvYXV0aC9sb2dpblwiLCB7XG4gICAgICBib2R5OiBge1widXNlcm5hbWVcIjogXCIke2NyZWRzW1widXNlcm5hbWVcIl19XCIsIFwicGFzc3dvcmRcIjogXCIke2NyZWRzW1wicGFzc3dvcmRcIl19XCJ9YCxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgIH0sXG4gICAgICBtZXRob2Q6IFwiUE9TVFwiXG4gICAgfSlcbiAgICAgIC50aGVuKHRoaXMuY2hlY2tfY29kZSlcbiAgICAgIC50aGVuKHJlcyA9PiByZXMuanNvbigpKVxuICAgICAgLnRoZW4oKHY6IGFueSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHYgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICB0aGlzLnNldF90b2tlbih2LmFjY2Vzc190b2tlbik7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJnb3QgdG9rZW5cIiArIHYuYWNjZXNzX3Rva2VuKTtcbiAgICAgICAgICB0aGlzLnJldHJpZXZlX3Byb2ZpbGUoKTtcbiAgICAgICAgICB0aGlzLnJldHJpZXZlX3BlcnNvbmFsX2V2YWx1YXRpb25zKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgIGBTb21ldGhpbmcgd2VudCB3cm9uZzogR290ICR7di5hY2Nlc3NfdG9rZW59IGZvciBsb2dpbiByZXNwb25zZWBcbiAgICAgICAgICApO1xuICAgICAgICAgIHRocm93IG5ldyBDb25uZWN0aW9uRXJyb3IoXG4gICAgICAgICAgICBcIkJBRF9SRVNQT05TRVwiLFxuICAgICAgICAgICAgXCJHb3QgdW5yZWNvZ25pemVkIGxvZ2luIHJlc3BvbnNlXCJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKiBBdHRlbXB0cyB0byBsb2dpbiB0byB0aGUgc2VydmVyICovXG4gIEBBY3Rpb25cbiAgYXN5bmMgcmVnaXN0ZXIoY3JlZHM6IExvZ2luSGFzaCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgXCJSZWdpc3RlcmluZyB0byBcIiArXG4gICAgICAgIHRoaXMuY29ubmVjdGlvbiEudXJsICtcbiAgICAgICAgXCIvYXV0aC9yZWdpc3RlclwiICtcbiAgICAgICAgXCIgd2l0aCBcIiArXG4gICAgICAgIGNyZWRzW1widXNlcm5hbWVcIl0gK1xuICAgICAgICBcIi9cIiArXG4gICAgICAgIGNyZWRzW1wicGFzc3dvcmRcIl1cbiAgICApO1xuICAgIC8vY3VybCAtWCBQT1NUIGh0dHA6Ly9sb2NhbGhvc3Q6ODA1MC9hdXRoL3JlZ2lzdGVyIC1kICd7XCJlbWFpbFwiOiBcImJsYWhAZ21haWwuY29tXCIsIFwicGFzc3dvcmRcIjogXCJibGFhaFwifScgLUggXCJDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cIlxuICAgIHJldHVybiAoXG4gICAgICBmZXRjaCh0aGlzLmNvbm5lY3Rpb24hLnVybCArIFwiL2F1dGgvcmVnaXN0ZXJcIiwge1xuICAgICAgICBib2R5OiBge1wiZW1haWxcIjogXCIke2NyZWRzW1widXNlcm5hbWVcIl19XCIsIFwicGFzc3dvcmRcIjogXCIke2NyZWRzW1wicGFzc3dvcmRcIl19XCJ9YCxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCJcbiAgICAgIH0pXG4gICAgICAgIC8vLnRoZW4odGhpcy5jaGVja19jb2RlKVxuICAgICAgICAvLy50aGVuKHJlcyA9PiByZXMuanNvbigpKVxuICAgICAgICAudGhlbigodjogUmVzcG9uc2UpID0+IHtcbiAgICAgICAgICBpZiAodi5vaykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZWdpc3RyYXRpb24gcmV0dXJuZWQgXCIgKyB2Lm9rKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgYFNvbWV0aGluZyB3ZW50IHdyb25nOiBHb3QgJHtKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgICAgICB2XG4gICAgICAgICAgICAgICl9IGZvciByZWdpc3RlciByZXNwb25zZWBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgQ29ubmVjdGlvbkVycm9yKFxuICAgICAgICAgICAgICBcIkJBRF9SRVNQT05TRVwiLFxuICAgICAgICAgICAgICBcIkdvdCB1bnJlY29nbml6ZWQgcmVnaXN0ZXIgcmVzcG9uc2VcIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBBdHRlbXB0cyB0byBsb2dpbiB0byB0aGUgc2VydmVyICovXG4gIEBBY3Rpb25cbiAgYXN5bmMgcmV0cmlldmVfcHJvZmlsZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zb2xlLmxvZyhcIkdldHRpbmcgXCIgKyB0aGlzLmNvbm5lY3Rpb24hLnVybCArIFwiL2F1dGgvcHJvZmlsZVwiKTtcbiAgICAvL2N1cmwgaHR0cDovL2xvY2FsaG9zdDo4MDUwL2F1dGgvcHJvZmlsZSAtSCBcIkF1dGhvcml6YXRpb246IEJlYXJlciBleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKMWMyVnlibS4uLlwiXG4gICAgcmV0dXJuIGF4aW9zXG4gICAgICAuZ2V0KHRoaXMuY29ubmVjdGlvbiEudXJsICsgXCIvYXV0aC9wcm9maWxlXCIsIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHt0aGlzLnRva2VufWBcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC50aGVuKCh2OiBhbnkpID0+IHtcbiAgICAgICAgdGhpcy5zZXRfdXNlcl9wcm9maWxlKHYuZGF0YSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKiBBdHRlbXB0cyB0byBzYXZlIGV2YWx1YXRpb24gdG8gdGhlIGRhdGFiYXNlICovXG4gIEBBY3Rpb25cbiAgYXN5bmMgc2F2ZV9ldmFsdWF0aW9uKGV2YWx1YXRpb246IEV2YWx1YXRpb25GaWxlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc29sZS5sb2coXG4gICAgICBcIlNhdmluZyBleGVjdXRpb24gdG8gXCIgKyB0aGlzLmNvbm5lY3Rpb24hLnVybCArIFwiL2V4ZWN1dGlvbnMvdXBsb2FkXCJcbiAgICApO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHt0aGlzLnRva2VufWBcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBheGlvc1xuICAgICAgLnBvc3QoXG4gICAgICAgIHRoaXMuY29ubmVjdGlvbiEudXJsICsgXCIvZXhlY3V0aW9ucy91cGxvYWRcIixcbiAgICAgICAge1xuICAgICAgICAgIGV2YWx1YXRpb246IGV2YWx1YXRpb24uZXhlY3V0aW9uLFxuICAgICAgICAgIGZpbGVuYW1lOiBldmFsdWF0aW9uLmZpbGVuYW1lXG4gICAgICAgIH0sXG4gICAgICAgIG9wdGlvbnNcbiAgICAgIClcbiAgICAgIC50aGVuKCh2OiBhbnkpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzYXZlZFwiKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqIEF0dGVtcHRzIHRvIHJldHJpZXZlIGEgbGlzdCBvZiBwZXJzb25hbCBldmFsdWF0aW9ucyAqL1xuICBAQWN0aW9uXG4gIGFzeW5jIHJldHJpZXZlX3BlcnNvbmFsX2V2YWx1YXRpb25zKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnNvbGUubG9nKFwiR2V0dGluZyBcIiArIHRoaXMuY29ubmVjdGlvbiEudXJsICsgXCIvZXhlY3V0aW9ucy9wZXJzb25hbFwiKTtcbiAgICAvL2N1cmwgaHR0cDovL2xvY2FsaG9zdDo4MDUwL2V4ZWN1dGlvbnMvcGVyc29uYWwgLUggXCJBdXRob3JpemF0aW9uOiBCZWFyZXIgZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SjFjMlZ5Ym0uLi5cIlxuICAgIHJldHVybiBheGlvc1xuICAgICAgLmdldCh0aGlzLmNvbm5lY3Rpb24hLnVybCArIFwiL2V4ZWN1dGlvbnMvcGVyc29uYWxcIiwge1xuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3RoaXMudG9rZW59YFxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRoZW4oKHY6IGFueSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcInBlcnNvbmFsIGV2YWxzOiBcIiArIEpTT04uc3RyaW5naWZ5KHYuZGF0YSkpO1xuICAgICAgICB0aGlzLnNldF91c2VyX2V2YWx1YXRpb25zKHYuZGF0YSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKiBBdHRlbXB0cyB0byByZXRyaWV2ZSBhIGxpc3Qgb2YgcGVyc29uYWwgZXZhbHVhdGlvbnMgKi9cbiAgQEFjdGlvblxuICBhc3luYyByZXRyaWV2ZV9ldmFsdWF0aW9uKGZpbGVfaWQ6IEZpbGVJRCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgXCJHZXR0aW5nIFwiICsgdGhpcy5jb25uZWN0aW9uIS51cmwgKyBcIi9leGVjdXRpb25zL2ZldGNoL1wiICsgZmlsZV9pZFxuICAgICk7XG4gICAgLy9jdXJsIGh0dHA6Ly9sb2NhbGhvc3Q6ODA1MC9leGVjdXRpb25zL3BlcnNvbmFsIC1IIFwiQXV0aG9yaXphdGlvbjogQmVhcmVyIGV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUoxYzJWeWJtLi4uXCJcbiAgICByZXR1cm4gYXhpb3NcbiAgICAgIC5nZXQodGhpcy5jb25uZWN0aW9uIS51cmwgKyBcIi9leGVjdXRpb25zL2ZldGNoL1wiICsgZmlsZV9pZCwge1xuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3RoaXMudG9rZW59YFxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRoZW4oKHY6IGFueSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImdvdCBldmFsdWF0aW9uOiBcIiArIEpTT04uc3RyaW5naWZ5KHYuZGF0YSkpO1xuICAgICAgICB0aGlzLnNldF9ldmFsdWF0aW9uKHYuZGF0YSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKiBPdXIgc3VwcG9zZWQgcm9sZSAqL1xuICAvLyBUT0RPOlxuXG4gIHByaXZhdGUgYXN5bmMgY2hlY2tfY29kZShyZXM6IFJlc3BvbnNlKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIC8vIGlmIG9rLCBwYXNzXG4gICAgY29uc29sZS5sb2coXCJjaGVja19jb2RlIHJlcy5vazogXCIgKyByZXMub2spO1xuICAgIGlmIChyZXMub2spIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiY2hlY2tfY29kZSByZXMuc3RhdHVzOiBcIiArIHJlcy5zdGF0dXMpO1xuICAgICAgY29uc29sZS5sb2coXCJjaGVja19jb2RlIHJlcy5ib2R5OiBcIiArIHJlcy5ib2R5KTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgc3dpdGNoIChyZXMuc3RhdHVzKSB7XG4gICAgICBjYXNlIDQwMTpcbiAgICAgICAgdGhyb3cgbmV3IENvbm5lY3Rpb25FcnJvcihcIlVOQVVUSE9SSVpFRFwiLCByZXMuc3RhdHVzVGV4dCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgQ29ubmVjdGlvbkVycm9yKFwiVU5LTk9XTlwiLCByZXMuc3RhdHVzVGV4dCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEhlaW1kYWxsU2VydmVyTW9kdWxlO1xuIl0sInZlcnNpb24iOjN9