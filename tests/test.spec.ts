import "jest";
import Vue from "vue";
import Vuetify from "vuetify";
import UploadNexus from "../src/components/global/UploadNexus.vue";

import { mount, createLocalVue } from "@vue/test-utils";
const localVue = createLocalVue();

const vuetify = new Vuetify();
describe("MyComponent.vue:", () => {
  beforeAll(() => {
    localStorage.setItem("auth_token", JSON.stringify("dummy-token"));
    console.log(localStorage.getItem("auth_token"));
  });
  it("Find the button", () => {
    const wrapper = mount(UploadNexus, {
      vuetify,
      localVue,
      propsData: {
        persistent: true,
        value: true
      }
    });
    console.log(wrapper);
    process.env.VUE_APP_API_URL = "test";
    expect(true).toBe(true);

    expect(wrapper.find("#logout").exists()).toBe(true);
  });
});
