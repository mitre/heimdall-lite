import "@mdi/font/css/materialdesignicons.css";
import Vue from "vue";
import Vuetify, { colors } from "vuetify/lib";
import Toasted from "vue-toasted";
import { ToastOptions } from "vue-toasted/types/index";

Vue.use(Vuetify);

Vue.use(Toasted);
// options to the toast
let options: ToastOptions = {
  theme: "toasted-primary",
  position: "top-center",
  fullWidth: true,
  containerClass: "background v-application",
  className: "white--text",
  action: {
    text: "Report Issue",
    href:
      "https://github.com/mitre/heimdall-vuetify/issues/new?assignees=&labels=bug&template=bug_report.md&title="
  },
  // icon: 'mdi-alert-octagram',
  duration: 5000
};

// register the toast with the custom message
Vue.toasted.register(
  "error",
  payload => {
    if (!payload.message) {
      return `ERROR: An unidentified error has occured, if functionality
        has degraded please try refreshing the page. If that does not fix the
        issue you are experiencing, then please report the issue`;
    }

    // The vue component passes in current dark mode setting, and the toast is adjusted
    // to be high contrast
    options.className += payload.isDark ? " invert" : "";

    // Display message passed by vue component
    return "ERROR: " + payload.message;
  },
  options
);

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
        mitre: "#303030",
        background: "#303030"
      },
      light: {
        ...statuses,
        ...severities,
        ...compliances,
        mitre: "#005B95",
        background: "#f8f8f8"
      }
    },
    options: {
      customProperties: true
    }
  }
});
