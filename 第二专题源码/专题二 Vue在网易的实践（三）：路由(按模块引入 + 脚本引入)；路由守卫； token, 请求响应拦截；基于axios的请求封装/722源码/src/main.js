import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'

Vue.config.productionTip = false

//路由拦截
let token = sessionStorage.getItem('token');
router.beforeEach((to,from,next)=>{
  if(to.meta.requireAuth){  //为true 需要通过验证才能跳入
    if(token){
      next();
      console.log('我进入了路由');
    }else{
      next({
        path:'/login'
      })
    }
  }else{
    next();
  }
})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
