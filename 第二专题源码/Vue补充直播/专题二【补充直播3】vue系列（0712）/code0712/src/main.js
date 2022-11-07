import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuePlugin from './plugins/index.js'
import pluginJoe from './pluginJoe.js'

Vue.config.productionTip = false
Vue.use(vuePlugin);
Vue.use(pluginJoe);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
