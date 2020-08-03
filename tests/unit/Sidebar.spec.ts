import 'jest';
import Vue from 'vue';
import Vuetify from 'vuetify';
import {getModule} from 'vuex-module-decorators';
import {mount, shallowMount, Wrapper} from '@vue/test-utils';
import Compare from '@/views/Compare.vue';
import {AllRaw, read_files, populate_hash} from '../util/fs';
import Store from '../../src/store/store';
import ReportIntakeModule, {
  next_free_file_ID
} from '../../src/store/report_intake';
import DataStore from '../../src/store/data_store';
import FilteredDataModule from '@/store/data_filters';
import StatusCountModule, {StatusHash} from '@/store/status_counts';
import {readFileSync} from 'fs';
import {
  ComparisonContext,
  ControlDelta,
  ControlSeries
} from '../../src/utilities/delta_util';
import InspecDataModule from '@/store/data_store';
import red_hat_bad from '../hdf_data/compare_data/red_hat_bad.json';
import red_hat_good from '../hdf_data/compare_data/red_hat_good.json';
import good_nginxresults from '../hdf_data/compare_data/good_nginxresults.json';
import bad_nginx from '../hdf_data/compare_data/bad_nginx.json';
import triple_overlay_profile from '../hdf_data/compare_data/triple_overlay_profile_example.json';
import acme from '../hdf_data/compare_data/wrapper-acme-run.json';
import {
  removeAllFiles,
  selectAllFiles,
  testSamples,
  loadSample,
  loadAll,
  Sample,
  fileCompliance
} from '../util/testingUtils';
import Results from '@/views/Results.vue';
import EvalInfo from '@/components/cards/EvaluationInfo.vue';
import ProfData from '@/components/cards/ProfData.vue';
import {profile_unique_key} from '../../src/utilities/format_util';
import StatusCardRow from '../../src/components/cards/StatusCardRow.vue';
import StatusChart from '../../src/components/cards/StatusChart.vue';
import SeverityChart from '../../src/components/cards/SeverityChart.vue';
import ComplianceChart from '../../src/components/cards/ComplianceChart.vue';
import ControlTable from '../../src/components/cards/controltable/ControlTable.vue';
import {context} from 'inspecjs';
import {EvaluationFile} from '../../src/store/report_intake';
import Sidebar from '../../src/components/global/Sidebar.vue';

const vuetify = new Vuetify();
let wrapper: Wrapper<Vue>;

wrapper = shallowMount(Sidebar, {
  vuetify,
  propsData: {}
});

let filter_store = getModule(FilteredDataModule, Store);
let data_store = getModule(InspecDataModule, Store);
let status_count = getModule(StatusCountModule, Store);

describe('Sidebar tests', () => {
  it('correct number of sidebar links', () => {
    loadAll();
    selectAllFiles();
    expect((wrapper.vm as any).visible_files.length).toBe(
      data_store.allFiles.length
    );
  });
  it('select/deselect all works', () => {
    (wrapper.vm as any).toggle_all();
    expect(filter_store.selected_file_ids).toEqual([]);
    (wrapper.vm as any).toggle_all();
    expect(filter_store.selected_file_ids.length).toEqual(
      data_store.allFiles.length
    );
  });
});
