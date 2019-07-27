import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/store';
import BootstrapVue from 'bootstrap-vue';

Vue.config.productionTip = false;
Vue.use(BootstrapVue);

import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/bootstrap-vue/dist/bootstrap-vue.css';

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
