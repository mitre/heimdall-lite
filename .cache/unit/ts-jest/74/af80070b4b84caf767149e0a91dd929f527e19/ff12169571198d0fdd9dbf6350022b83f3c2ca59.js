"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("jest");
const vuetify_1 = tslib_1.__importDefault(require("vuetify"));
const UploadNexus_vue_1 = tslib_1.__importDefault(require("@/components/global/UploadNexus.vue"));
const vuex_module_decorators_1 = require("vuex-module-decorators");
const test_utils_1 = require("@vue/test-utils");
const server_1 = tslib_1.__importDefault(require("@/store/server"));
const vuetify = new vuetify_1.default();
let wrapper;
let mod = vuex_module_decorators_1.getModule(server_1.default);
beforeEach(() => {
    localStorage.setItem("auth_token", JSON.stringify("dummy-token"));
    wrapper = test_utils_1.shallowMount(UploadNexus_vue_1.default, {
        vuetify,
        propsData: {
            persistent: true,
            value: true
        }
    });
});
describe("UploadNexus.vue", () => {
    it("Set token module works", () => {
        mod.set_token("dummy-token");
        expect(mod.token).toBe("dummy-token");
    });
    it("Server mode module check", () => {
        process.env.VUE_APP_API_URL = "testurl";
        mod.server_mode();
        expect(mod.serverMode).toBe(true);
    });
    it("Logout button exist when logged in", async () => {
        process.env.VUE_APP_API_URL = "test";
        mod.server_mode();
        //await wrapper.vm.$nextTick()
        expect(wrapper.find("#logout").exists()).toBe(true);
    });
    it("Logout button doesn't exist when logged out", async () => {
        mod.clear_token();
        process.env.VUE_APP_API_URL = "test";
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#logout").exists()).toBe(false);
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL3Nqb3NoaS90ZXN0L2hlaW1kYWxsLWxpdGUvdGVzdHMvdW5pdC9VcGxvYWROZXh1cy5zcGVjLnRzIiwibWFwcGluZ3MiOiI7OztBQUFBLGdCQUFjO0FBRWQsOERBQThCO0FBQzlCLGtHQUE4RDtBQUM5RCxtRUFBbUQ7QUFFbkQsZ0RBQStEO0FBQy9ELG9FQUEwQztBQUUxQyxNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFPLEVBQUUsQ0FBQztBQUM5QixJQUFJLE9BQXFCLENBQUM7QUFDMUIsSUFBSSxHQUFHLEdBQUcsa0NBQVMsQ0FBQyxnQkFBWSxDQUFDLENBQUM7QUFFbEMsVUFBVSxDQUFDLEdBQUcsRUFBRTtJQUNkLFlBQVksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztJQUVsRSxPQUFPLEdBQUcseUJBQVksQ0FBQyx5QkFBVyxFQUFFO1FBQ2xDLE9BQU87UUFDUCxTQUFTLEVBQUU7WUFDVCxVQUFVLEVBQUUsSUFBSTtZQUNoQixLQUFLLEVBQUUsSUFBSTtTQUNaO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxRQUFRLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO0lBQy9CLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7UUFDaEMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN4QyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7UUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO1FBQ3hDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNsQixNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwQyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxvQ0FBb0MsRUFBRSxLQUFLLElBQUksRUFBRTtRQUNsRCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7UUFDckMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2xCLDhCQUE4QjtRQUM5QixNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0RCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyw2Q0FBNkMsRUFBRSxLQUFLLElBQUksRUFBRTtRQUMzRCxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO1FBQ3JDLE1BQU0sT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM3QixNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN2RCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9zam9zaGkvdGVzdC9oZWltZGFsbC1saXRlL3Rlc3RzL3VuaXQvVXBsb2FkTmV4dXMuc3BlYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCJqZXN0XCI7XG5pbXBvcnQgVnVlIGZyb20gXCJ2dWVcIjtcbmltcG9ydCBWdWV0aWZ5IGZyb20gXCJ2dWV0aWZ5XCI7XG5pbXBvcnQgVXBsb2FkTmV4dXMgZnJvbSBcIkAvY29tcG9uZW50cy9nbG9iYWwvVXBsb2FkTmV4dXMudnVlXCI7XG5pbXBvcnQgeyBnZXRNb2R1bGUgfSBmcm9tIFwidnVleC1tb2R1bGUtZGVjb3JhdG9yc1wiO1xuXG5pbXBvcnQgeyBtb3VudCwgc2hhbGxvd01vdW50LCBXcmFwcGVyIH0gZnJvbSBcIkB2dWUvdGVzdC11dGlsc1wiO1xuaW1wb3J0IFNlcnZlck1vZHVsZSBmcm9tIFwiQC9zdG9yZS9zZXJ2ZXJcIjtcblxuY29uc3QgdnVldGlmeSA9IG5ldyBWdWV0aWZ5KCk7XG5sZXQgd3JhcHBlcjogV3JhcHBlcjxWdWU+O1xubGV0IG1vZCA9IGdldE1vZHVsZShTZXJ2ZXJNb2R1bGUpO1xuXG5iZWZvcmVFYWNoKCgpID0+IHtcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJhdXRoX3Rva2VuXCIsIEpTT04uc3RyaW5naWZ5KFwiZHVtbXktdG9rZW5cIikpO1xuXG4gIHdyYXBwZXIgPSBzaGFsbG93TW91bnQoVXBsb2FkTmV4dXMsIHtcbiAgICB2dWV0aWZ5LFxuICAgIHByb3BzRGF0YToge1xuICAgICAgcGVyc2lzdGVudDogdHJ1ZSxcbiAgICAgIHZhbHVlOiB0cnVlXG4gICAgfVxuICB9KTtcbn0pO1xuXG5kZXNjcmliZShcIlVwbG9hZE5leHVzLnZ1ZVwiLCAoKSA9PiB7XG4gIGl0KFwiU2V0IHRva2VuIG1vZHVsZSB3b3Jrc1wiLCAoKSA9PiB7XG4gICAgbW9kLnNldF90b2tlbihcImR1bW15LXRva2VuXCIpO1xuICAgIGV4cGVjdChtb2QudG9rZW4pLnRvQmUoXCJkdW1teS10b2tlblwiKTtcbiAgfSk7XG5cbiAgaXQoXCJTZXJ2ZXIgbW9kZSBtb2R1bGUgY2hlY2tcIiwgKCkgPT4ge1xuICAgIHByb2Nlc3MuZW52LlZVRV9BUFBfQVBJX1VSTCA9IFwidGVzdHVybFwiO1xuICAgIG1vZC5zZXJ2ZXJfbW9kZSgpO1xuICAgIGV4cGVjdChtb2Quc2VydmVyTW9kZSkudG9CZSh0cnVlKTtcbiAgfSk7XG5cbiAgaXQoXCJMb2dvdXQgYnV0dG9uIGV4aXN0IHdoZW4gbG9nZ2VkIGluXCIsIGFzeW5jICgpID0+IHtcbiAgICBwcm9jZXNzLmVudi5WVUVfQVBQX0FQSV9VUkwgPSBcInRlc3RcIjtcbiAgICBtb2Quc2VydmVyX21vZGUoKTtcbiAgICAvL2F3YWl0IHdyYXBwZXIudm0uJG5leHRUaWNrKClcbiAgICBleHBlY3Qod3JhcHBlci5maW5kKFwiI2xvZ291dFwiKS5leGlzdHMoKSkudG9CZSh0cnVlKTtcbiAgfSk7XG5cbiAgaXQoXCJMb2dvdXQgYnV0dG9uIGRvZXNuJ3QgZXhpc3Qgd2hlbiBsb2dnZWQgb3V0XCIsIGFzeW5jICgpID0+IHtcbiAgICBtb2QuY2xlYXJfdG9rZW4oKTtcbiAgICBwcm9jZXNzLmVudi5WVUVfQVBQX0FQSV9VUkwgPSBcInRlc3RcIjtcbiAgICBhd2FpdCB3cmFwcGVyLnZtLiRuZXh0VGljaygpO1xuICAgIGV4cGVjdCh3cmFwcGVyLmZpbmQoXCIjbG9nb3V0XCIpLmV4aXN0cygpKS50b0JlKGZhbHNlKTtcbiAgfSk7XG59KTtcbiJdLCJ2ZXJzaW9uIjozfQ==