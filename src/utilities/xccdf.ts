//var parser = require("xml2json");
import parser from "xml2js";
import { parse } from "inspecjs";
import CCI from "./cci";
import { thisTypeAnnotation, VariableDeclaration } from "@babel/types";

const valid_tags = [
  "VulnDiscussion",
  "FalsePositives",
  "FalseNegatives",
  "Documentable",
  "Mitigations",
  "SeverityOverrideGuidance",
  "PotentialImpacts",
  "PotentialImpacts",
  "ThirdPartyTools",
  "MitigationControl",
  "Responsibility",
  "IAControl"
];

interface Hash {
  [key: string]: any;
}

class XCCDF {
  xmlJSON: { [key: string]: any };
  profileJSON: parse.ConversionResult;
  constructor(fileString: string) {
    let json: Hash;
    let parse = new parser.Parser({
      explicitArray: false,
      mergeAttrs: true,
      async: false
    });
    parse.parseString(fileString, (err: Error, result: Hash) => {
      json = result.Benchmark;
    });
    this.xmlJSON = json;
    var cci: CCI = new CCI();
    var profile: Hash = {};
    profile.controls = [];
    profile.groups = [];
    profile["name"] = this.xmlJSON.id;
    if (!profile["version"]) profile["version"] = "0.1.0";
    profile["title"] = this.xmlJSON.title;
    if (!profile["maintainer"]) profile["maintainer"] = "The Authors";
    if (!profile["copyright"]) profile["copyright"] = "The Authors";
    if (!profile["copyright_email"])
      profile["copyright_email"] = "you@example.com";
    profile["supports"] = [
      {
        "platform-family": "any",
        "platform-name": "any",
        platform: "any",
        release: "any",
        "os-family": "any",
        "os-name": "any"
      }
    ];
    profile["depends"] = [
      {
        name: "any",
        url: "any",
        branch: "any",
        path: "any",
        skip_message: "any",
        status: "any",
        git: "any",
        supermarket: "any",
        compliance: "any"
      }
    ];
    profile["inputs"] = [];
    profile["status"] =
      this.xmlJSON.status.plaintext + " on " + this.xmlJSON.status.date;
    profile["generator"] = { name: "inspec_tools_js", version: "1.0.0" };
    profile["sha256"] =
      "7ba8a22e3ba778185bc6603ad0650996d0c93d2111d275273f1f4dc945bdb271";

    for (var group of this.xmlJSON.Group) {
      var control: any = {};
      control["id"] = group.id;
      control["title"] = group.Rule.title;

      let p = new parser.Parser({
        explicitArray: false,
        mergeAttrs: true,
        async: false
      });
      p.parseString(
        "<rooty>" + group.Rule.description + "</rooty>",
        (err: Error, result2: Hash) => {
          group.Rule.description = result2.rooty;
        }
      );
      control["desc"] = group.Rule.description.VulnDiscussion.split(
        "Satisfies: "
      )[0];
      control["impact"] = this.compute_impact(group.Rule.severity); // "high" // Utils::InspecUtil.get_impact(group.Rule.severity)
      control["refs"] = [];
      control["tags"] = {};
      control["tags"]["gtitle"] = group.title;
      if (group.Rule.description.VulnDiscussion.split("Satisfies: ").length > 1)
        control["tags"][
          "satisfies"
        ] = group.Rule.description.VulnDiscussion.split("Satisfies: ")[1]
          .split(",")
          .map((elem: string) => {
            return elem.replace(/(^\s+|\s+$)/g, "");
          });
      control["tags"]["gid"] = group.id;
      control["tags"]["rid"] = group.Rule.id;
      control["tags"]["stig_id"] = group.Rule.version;
      control["tags"]["fix_id"] = group.Rule.fix.id;
      control["tags"]["cci"] = group.Rule.ident._;
      control["tags"]["nist"] = []; //@cci_items.fetch_nists(group.Rule.idents)
      if (!group.Rule.ident._)
        for (var cciTag of group.Rule.ident)
          control["tags"]["nist"].push(cci.lookup(cciTag._));
      //@cci_items.fetch_nists(group.Rule.idents)
      else control["tags"]["nist"] = [cci.lookup(group.Rule.ident._)]; //@cci_items.fetch_nists(group.Rule.idents)
      control["tags"]["nist"].push("Rev_4");
      if (group.Rule.description.FalseNegatives != "")
        control["tags"]["false_negatives"] =
          group.Rule.description.FalseNegatives;
      if (group.Rule.description.FalsePositives != "")
        control["tags"]["false_positives"] =
          group.Rule.description.FalsePositives;
      if (group.Rule.description.Documentable != "")
        control["tags"]["documentable"] = group.Rule.description.Documentable;
      if (group.Rule.description.Mitigations != "")
        control["tags"]["mitigations"] = group.Rule.description.FalseNegatives;
      if (group.Rule.description.SeverityOverrideGuidance != "")
        control["tags"]["severity_override_guidance"] =
          group.Rule.description.SeverityOverrideGuidance;
      if (group.Rule.description.PotentialImpacts != "")
        control["tags"]["potential_impacts"] =
          group.Rule.description.PotentialImpacts;
      if (group.Rule.description.ThirdPartyTools != "")
        control["tags"]["third_party_tools"] =
          group.Rule.description.ThirdPartyTools;
      if (group.Rule.description.MitigationControls != "")
        control["tags"]["mitigation_controls"] =
          group.Rule.description.MitigationControls;
      if (group.Rule.description.Responsibility != "")
        control["tags"]["responsibility"] =
          group.Rule.description.Responsibility;
      if (group.Rule.description.IAControls != "")
        control["tags"]["ia_controls"] = group.Rule.description.IAControls;
      control["tags"]["check"] = group.Rule["check-content"];
      control["tags"]["fix"] = group.Rule.fixtext._;
      control["code"] = "";
      control["source_location"] = { ref: "", line: 0 };
      control["results"] = [];
      control["waver_data"] = {};
      let c: parse.AnyFullControl = control;
      profile.controls.push(control);
      profile.groups.push({
        controls: [group.id],
        id: `controls/${group.id}.rb`,
        title: group.title
      });
    }
    this.profileJSON = profile;
  }

  compute_impact(severity: string): number {
    if (severity === "low") return 0.3;
    else if (severity === "medium") return 0.6;
    else if (severity === "high") return 1.0;
    return 0.0;
  }

  jsonify() {
    return JSON.stringify(this.profileJSON);
  }
}
export default XCCDF;
