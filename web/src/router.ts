import Vue from 'vue';
import Router from 'vue-router';
import Start from './views/start.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Start,
    },
    {
      path: '/game',
      name: 'game',
      component: () => import(/* webpackChunkName: "about" */ './views/in-game.vue'),
    },
  ],
});
