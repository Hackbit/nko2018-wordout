import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { socket } from './services/socket';
import './registerServiceWorker';

Vue.config.productionTip = false;

socket.connect();

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
