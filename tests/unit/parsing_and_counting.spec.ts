import chai from "chai";
import chai_as_promised from "chai-as-promised";
chai.use(chai_as_promised);
const expect = chai.expect;

import Store from "../../src/store/store";
import ReportIntakeModule from "../../src/store/report_intake";
import { getModule } from "vuex-module-decorators";
import { AllRaw } from "../util/fs";
import { fail } from "assert";
// import { shallowMount } from "@vue/test-utils";

describe("Parsing", () => {
  it("Report intake can read every raw file in hdf_data", function() {
    // Give it time!
    this.timeout(0);
    let raw = AllRaw();
    let intake = getModule(ReportIntakeModule, Store);
    let id = 0;

    let promises = Object.values(raw).map(file_result => {
      // Increment counter
      id += 1;

      // Do intake
      return intake.loadText({
        filename: file_result.name,
        unique_id: id,
        text: file_result.content
      });
    });

    // Done!
    return Promise.all(promises.map(p => expect(p).to.eventually.be.null));
  });
});
