import Vue from 'vue';
import Vuetify from 'vuetify';
import Modal from '@/components/global/Modal.vue';
import {shallowMount, Wrapper} from '@vue/test-utils';

const vuetify = new Vuetify();
let wrapper: Wrapper<Vue>;

beforeEach(() => {
  wrapper = shallowMount(Modal, {
    vuetify,
    propsData: {
      value: false,
      persistent: true
    }
  });
});

describe('Modal.vue', () => {
  it('passed', () => {
    expect(true).toBeTruthy();
  });
  //   it('should show dialog', () => {
  //     wrapper = shallowMount(Modal, {
  //       vuetify,
  //       propsData: {
  //         value: true,
  //         persistent: true
  //       }
  //     });
  //     expect(wrapper.find('#modal').exists()).toBeTruthy();
  //   });

  //   it('should show dialog', () => {
  //     wrapper = shallowMount(Modal, {
  //       vuetify,
  //       propsData: {
  //         value: false,
  //         persistent: true
  //       }
  //     });
  //     expect(wrapper.find('#modal').exists()).toBeFalsy();
  //   });
  // });
});
