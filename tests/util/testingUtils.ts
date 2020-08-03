import 'jest';
import {getModule} from 'vuex-module-decorators';
import {AllRaw, read_files, populate_hash} from '../util/fs';
import Store from '../../src/store/store';
import ReportIntakeModule, {
  next_free_file_ID
} from '../../src/store/report_intake';
import DataStore from '../../src/store/data_store';
import FilteredDataModule from '@/store/data_filters';
import StatusCountModule, {StatusHash} from '@/store/status_counts';
import InspecDataModule from '@/store/data_store';
import red_hat_bad from '../hdf_data/compare_data/red_hat_bad.json';
import red_hat_good from '../hdf_data/compare_data/red_hat_good.json';
import good_nginxresults from '../hdf_data/compare_data/good_nginxresults.json';
import bad_nginx from '../hdf_data/compare_data/bad_nginx.json';
import triple_overlay_profile from '../hdf_data/compare_data/triple_overlay_profile_example.json';
import acme from '../hdf_data/compare_data/wrapper-acme-run.json';
import {readFileSync} from 'fs';

let filter_store = getModule(FilteredDataModule, Store);
let data_store = getModule(InspecDataModule, Store);
let status_count = getModule(StatusCountModule, Store);

let results = read_files('tests/hdf_data/compare_data/');
let raw = populate_hash(results);
//let raw = populate_hash(results);
let intake = getModule(ReportIntakeModule, Store);
let id = 0;

export interface Sample {
  name: string;
  sample: any;
}

export let testSamples = [
  {
    name: 'NGINX Clean Sample',
    sample: good_nginxresults
  },
  {
    name: 'NGINX With Failing Tests',
    sample: bad_nginx
  },
  {
    name: 'Red Hat With Failing Tests',
    sample: red_hat_bad
  },
  {
    name: 'Red Hat Clean Sample',
    sample: red_hat_good
  },
  {
    name: 'Triple Overlay Example',
    sample: triple_overlay_profile
  },
  {
    name: 'Acme Overlay',
    sample: acme
  }
];

export function loadSample(sampleName: string) {
  let sample: Sample = {name: '', sample: ''};
  for (let samp of testSamples) {
    if (samp.name == sampleName) {
      sample = samp;
    }
  }
  if (sample.name === '') {
    return;
  }
  return intake.loadText({
    filename: sampleName,
    unique_id: next_free_file_ID(),
    text: JSON.stringify(sample.sample)
  });
}

export function loadAll(): void {
  let data = AllRaw();
  Object.values(data).map(file_result => {
    // Increment counter
    id += 1;

    // Do intake
    return intake.loadText({
      filename: file_result.name,
      unique_id: id,
      text: file_result.content
    });
  });
}

export function removeAllFiles(): void {
  let ids = data_store.allFiles.map(f => f.unique_id);
  for (let id of ids) {
    data_store.removeFile(id);
  }
}

export function selectAllFiles(): void {
  for (let file of data_store.allFiles) {
    filter_store.set_toggle_file_on(file.unique_id);
  }
}

export function fileCompliance(id: number) {
  let filter = {fromFile: [id]};
  let passed = status_count.passed(filter);
  let total =
    passed +
    status_count.failed(filter) +
    status_count.profileError(filter) +
    status_count.notReviewed(filter);
  if (total == 0) {
    return 0;
  }
  return Math.round((100.0 * passed) / total);
}

export function expectedCount(status: string) {
  let failed = 0;
  let passed = 0;
  let notReviewed = 0;
  let notApplicable = 0;
  let profileError = 0;
  let exec_files = data_store.executionFiles;

  // For each, we will filter then count
  exec_files.forEach(file => {
    // Get the corresponding count file
    let count_filename = `tests/hdf_data/counts/${file.filename}.info.counts`;
    let count_file_content = readFileSync(count_filename, 'utf-8');
    let counts: any = JSON.parse(count_file_content);

    failed += counts.failed.total;
    passed += counts.passed.total;
    notReviewed += counts.skipped.total;
    notApplicable += counts.no_impact.total;
    profileError += counts.error.total;
  });

  if (status == 'failed') {
    return failed;
  } else if (status == 'passed') {
    return passed;
  } else if (status == 'notReviewed') {
    return notReviewed;
  } else if (status == 'notApplicable') {
    return notApplicable;
  } else if (status == 'profileError') {
    return profileError;
  } else {
    return 0;
  }
}
