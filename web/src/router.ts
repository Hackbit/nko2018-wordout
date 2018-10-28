import Vue from 'vue';
import Router from 'vue-router';
import Start from './views/start.vue';
import SinglePlayerGame from './views/gameplay/single-player.vue';

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
      path: '/game/single-player',
      name: 'single-player',
      component: SinglePlayerGame,
    },
  ],
});
