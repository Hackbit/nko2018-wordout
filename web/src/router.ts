import Vue from 'vue';
import Router from 'vue-router';
import Start from './views/start.vue';
import SinglePlayerGame from './views/gameplay/single-player.vue';
import GlobalChallenge from './views/gameplay/global.vue';
import TwoPlayerGame from './views/gameplay/two-player.vue';

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
    {
      path: '/game/two-player',
      name: 'two-player',
      component: TwoPlayerGame,
    },
    {
      path: '/game/global',
      name: 'global',
      component: GlobalChallenge,
    },
  ],
});
