import "@mdi/font/css/materialdesignicons.css";
import Vue from "vue";
import Vuetify, { colors } from "vuetify/lib";

Vue.use(Vuetify);

// "Not Applicable" | "Not Reviewed" | "Profile Error";
let statuses = {
  statusPassed: colors.green.base,
  statusFailed: colors.red.base,
  statusNotApplicable: colors.lightBlue.base,
  statusNoData: colors.orange.lighten1,
  statusNotReviewed: colors.orange.base,
  statusProfileError: colors.indigo.base,
  statusNotRun: colors.teal.darken2,
  statusFromProfile: colors.teal.base
};

let branding = {
  mitreBlue: "#005B95"
};

let severities = {
  severityLow: colors.yellow.base,
  severityMedium: colors.orange.base,
  severityHigh: colors.deepOrange.base,
  severityCritical: colors.red.base
};

let compliances = {
  complianceLow: colors.red.base,
  complianceMedium: colors.yellow.base,
  complianceHigh: colors.green.base
};

export default new Vuetify({
  icons: {
    iconfont: "mdi"
  },
  theme: {
    dark: true,
    themes: {
      dark: {
        ...statuses,
        ...severities,
        ...compliances,
        ...branding,
        background: "#303030"
      },
      light: {
        ...statuses,
        ...severities,
        ...compliances,
        ...branding,
        background: "#f8f8f8"
      }
    },
    options: {
      customProperties: true
    }
  }
});
