import Vue from 'vue';
import Router from 'vue-router';
import Results from '@/views/Results.vue';
import Compare from '@/views/Compare.vue';
import Landing from '@/views/Landing.vue';
import Profile from '@/views/Profile.vue';
import Auth from '@/views/Auth.vue';
import Login from '@/views/Login.vue';
import Signup from '@/views/Signup.vue';
import Usergroup from '@/views/Usergroup.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/results',
      name: 'results',
      component: Results
    },
    {
      path: '/compare',
      name: 'compare',
      component: Compare
    },
    {
      path: '/',
      name: 'home',
      component: Landing
    },
    {
      path: '/home',
      name: 'home',
      component: Landing
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    },
    {
      path: '/usergroup/:id',
      name: 'usergroup',
      component: Usergroup
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup
    },
    {
      path: '*',
      redirect: '/results/all'
    }
  ]
});
