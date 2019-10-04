import "@mdi/font/css/materialdesignicons.css";
import Vue from "vue";
import Vuetify, { colors } from "vuetify/lib";
import { VuetifyParsedThemeItem } from "vuetify/types/services/theme";
import Chroma from "chroma-js";

Vue.use(Vuetify);

// "Not Applicable" | "Not Reviewed" | "Profile Error";
const statuses = {
  statusPassed: colors.green.base,
  statusFailed: colors.red.base,
  statusNotApplicable: colors.lightBlue.base,
  statusNoData: colors.orange.lighten1,
  statusNotReviewed: colors.orange.base,
  statusProfileError: colors.indigo.base,
  statusNotRun: colors.teal.darken2,
  statusFromProfile: colors.teal.base
};

type CustColor = VuetifyParsedThemeItem;

/** Bounds luminance so it never quite reaches 0 or 1 */
function lum_sigmoid(t: number, shift: number) {
  // The base sigmoid maps [-infinity, infinity] to [0, 1]
  // return 1/(1+Math.pow(Math.E, -t));
  // First compute inverse sigmoid to find our starting place
  let logit_t = -Math.log(1 / t - 1);

  // Then shift in domain and recompute using sigmoid
  let shifted_logit = logit_t + shift;
  let shifted_sigmoid = 1 / (1 + Math.pow(Math.E, -shifted_logit));

  console.log(
    `Base: ${t};\nLogit: ${logit_t};\nShifted logit: ${shifted_logit};\nShifted sigmoid: ${shifted_sigmoid};`
  );
  return shifted_sigmoid;
}

/** Shifts a colors luminance by the specified amount */
function shift(base_color: string, amount: number): string {
  let c = Chroma.hex(base_color);
  let base_l = c.luminance();
  let new_l = lum_sigmoid(base_l, amount);
  let new_c = c.luminance(new_l);
  console.log(`Shifting ${base_color} by ${amount} yielded ${new_c.hex()}`);
  return new_c.hex();
}

/** Gen variations on a color */
const BASE_SPREAD = 0.5;
function gen_variants(
  base_color: string,
  spread: number = BASE_SPREAD
): CustColor {
  return {
    darken4: shift(base_color, -4 * spread),
    darken3: shift(base_color, -3 * spread),
    darken2: shift(base_color, -2 * spread),
    darken1: shift(base_color, -1 * spread),
    base: base_color,
    lighten1: shift(base_color, 1 * spread),
    lighten2: shift(base_color, 2 * spread),
    lighten3: shift(base_color, 3 * spread),
    lighten4: shift(base_color, 4 * spread),
    lighten5: shift(base_color, 5 * spread)
  };
}

// Get colors generated from base mitre using UtilColorGenerator.
// These are identical to default vuetify shading, but now we can access them programatically!
let mitrePrimaryBlue = gen_variants("#005b94");
let mitrePrimaryGrey = gen_variants("#5f636a");
let mitreSecondaryGrey = gen_variants("#cfdeea");
let mitreSecondaryBlue = gen_variants("#00b3dc");
let darkBackground = gen_variants("#303030", BASE_SPREAD);
let lightBackground = gen_variants("#d6d6d6", BASE_SPREAD);

const branding = {
  mitrePrimaryBlue,
  mitrePrimaryGrey,
  mitreSecondaryGrey,
  mitreSecondaryBlue,
  mitreSecondaryGreen: "#BFD228",
  mitreSecondaryYellow: "#FFE23C",
  mitreSecondaryOrange: "#F7901E",
  mitreSecondaryRed: "#C6401D",
  mitreSectionBackground: "#f3f2f2", //#eff3f5;
  mitreSectionBorder: "#cfcfcf", //#b4bfae
  mitreCardShadow: "#d6d6d6"
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

const veautiful = new Vuetify({
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
        primary: mitrePrimaryGrey,
        secondary: darkBackground
      },
      light: {
        ...statuses,
        ...severities,
        ...compliances,
        ...branding,
        primary: mitrePrimaryBlue,
        secondary: lightBackground
      }
    },
    options: {
      customProperties: true
    }
  }
});
export default veautiful;

/*** colors from new MII homepage ***/
/*
@highlightGrey: #999999;
@cardLabelIcons: #aaaaaa;
@cardShadow: #d6d6d6;
@fontLink: #3366cc;     //#006fce;
@fontLinkVisited: #72078f;
@fontBody: #333333;
@fontTitle: #333333;
@contentBackground: #ffffff;    //#eff3f5;
@orangeBackground: #f4b436;
@navHighlightBlue: #56c5f2;
@highlight-background-color: @cardShadow;
@link-color: @fontLink;         //#0015E8;
@sectionBackground: #f3f2f2;    //#eff3f5;
@sectionBorder: #cfcfcf;        //#b4bfae
/*outlook chart states*/
/*
@outlookBusy: #9698ce;
@outlookOut: #a96ead;
@colorBackground: @contentBackground;
@mitrePrimaryBlue: #005B94;
@mitrePrimaryGrey: #5f636a;
@mitreSecondaryGreen: #BFD228;
@mitreSecondaryGrey: #CFDEEA;
@mitreSecondaryBlue: #00B3DC;
@mitreSecondaryYellow: #FFE23C;
@mitreSecondaryOrange: #F7901E;
@mitreSecondaryRed: #C6401D;
@themeGreen: #9bc25b;
@projectPagesGreen: #5ea100;
@footerBlack: #333333;
@emergencyNewsRed: @mitreSecondaryRed;
@errorBackground: #FFBABA;
@warningBackground: #f9f2ca;
@feedbackOrange: #f7c869;
@feedExternalNews: #85adb3;
@feedModeling: #61b83c;
@feedEcis: @themeGreen;
@feedCustom: #e7a53c;
@feedEvent: #7184a9;
@feedMitre: @mitrePrimaryBlue;
@feedWorkstream: @mitreSecondaryBlue;
@coverageGraphAxisGrey: #b2c8d3;
*/
