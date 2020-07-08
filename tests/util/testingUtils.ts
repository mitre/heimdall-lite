import 'jest';
import {AllRaw} from '../util/fs';
import {
  InspecIntakeModule,
  next_free_file_ID
} from '../../src/store/report_intake';
import {FilteredDataModule} from '@/store/data_filters';
import {StatusCountModule} from '@/store/status_counts';
import {InspecDataModule} from '@/store/data_store';
import {samples, Sample} from '@/utilities/sample_util';
import {readFileSync} from 'fs';

let id = 0;

export function loadSample(sampleName: string) {
  let sample: Sample = {name: '', sample: ''};
  for (let samp of samples) {
    if (samp.name == sampleName) {
      sample = samp;
    }
  }
  if (sample.name === '') {
    return;
  }
  return InspecIntakeModule.loadText({
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
    return InspecIntakeModule.loadText({
      filename: file_result.name,
      unique_id: id,
      text: file_result.content
    });
  });
}

export function removeAllFiles(): void {
  let ids = InspecDataModule.allFiles.map(f => f.unique_id);
  for (let id of ids) {
    InspecDataModule.removeFile(id);
  }
}

export function selectAllFiles(): void {
  for (let file of InspecDataModule.allFiles) {
    FilteredDataModule.set_toggle_file_on(file.unique_id);
  }
}

export function fileCompliance(id: number) {
  let filter = {fromFile: [id]};
  let passed = StatusCountModule.countOf(filter, 'Passed');
  let total =
    passed +
    StatusCountModule.countOf(filter, 'Failed') +
    StatusCountModule.countOf(filter, 'Profile Error') +
    StatusCountModule.countOf(filter, 'Not Reviewed');
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

  // For each, we will filter then count
  InspecDataModule.executionFiles.forEach(file => {
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
