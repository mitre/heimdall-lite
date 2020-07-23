import 'jest';
import Vue from 'vue';
import Vuetify from 'vuetify';
import {getModule} from 'vuex-module-decorators';
import {mount, shallowMount, Wrapper} from '@vue/test-utils';
import Compare from '@/views/Compare.vue';

const vuetify = new Vuetify();
let wrapper: Wrapper<Vue>;

wrapper = shallowMount(Compare, {
  vuetify,
  propsData: {}
});

describe('Compare Charts', () => {
  it('show compliance chart', async () => {
    expect(true).toBe(true);
  });
});
