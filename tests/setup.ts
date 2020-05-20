import Vue from "vue";
import Vuetify from "vuetify";

process.env.VUE_APP_API_URL = "test_url";
localStorage.setItem("auth_token", JSON.stringify("dummy-token"));
Vue.use(Vuetify);
