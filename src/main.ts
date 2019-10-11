import Vue from "vue";
import App from "@/App.vue";
import router from "@/router";
import store from "@/store/store";
import vuetify from "@/plugins/vuetify"; // path to vuetify export
import "roboto-fontface/css/roboto/roboto-fontface.css";
//import "@mdi/font/css/materialdesignicons.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import VueAnalytics from "vue-analytics";
import VueRouter from "vue-router";

const routes = new VueRouter({
  routes: [
    {
      path: "/results/:id",
      name: "results"
    },
    {
      path: "/compare",
      name: "compare"
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "@/views/About.vue")
    },
    {
      path: "/",
      name: "home"
    },
    {
      path: "*",
      redirect: "/results/all"
    }
  ]
});

Vue.use(VueAnalytics, {
  id: "UA-149784359-1",
  routes,
  autoTracking: {
    screenview: true
  }
});

// in components
this.$ga.event("category", "action", "label", 123);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");

// The following line is a hot patch to add regex support, theyre are better
// places to edit Prism variables, but could not locate them. Namely this is
// the Prism library variables, and not the Prism component variables
//@ts-ignore
Prism.languages.rb.string[5].pattern = /("|')(\1|(?:(?![^\\]\1)[\s\S])*[^\\]\1)/g;
