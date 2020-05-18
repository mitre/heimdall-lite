import "jest";
import Vue from "vue";
import Vuetify from "vuetify";
import UploadNexus from "../src/components/global/UploadNexus.vue";

import { mount, createLocalVue } from "@vue/test-utils";
const localVue = createLocalVue();

const vuetify = new Vuetify();

describe("MyComponent.vue:", () => {
  it("1. Mounts properly", () => {
    const wrapper = mount(UploadNexus, {
      localVue,
      vuetify
    });
    expect(wrapper.isVueInstance()).toBe(true);
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

    expect(wrapper.find(".v-btn").exists()).toBe(true);
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
    wrapper.setData({ is_logged_in: true });
    expect(wrapper.find("#test").exists()).toBe(true);
  });
});
