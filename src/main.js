import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid'

// 导入全局样式表
import './assets/css/global.css'
Vue.config.productionTip = false
    // 配置请求的路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
    // Do something before request is sent
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config;
}, error => {
    // Do something with request error
    return Promise.reject(error);
});
Vue.component('tree-table', TreeTable)
Vue.prototype.$http = axios
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')