import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () =>
    import ('../components/Login.vue')
const Home = () =>
    import ('../components/Home.vue')
Vue.use(VueRouter)
const routes = [{
    path: '/',
    redirect: '\login'
}, {
    path: '/login',
    component: Login
}, {
    path: '/home',
    component: Home
}]

const router = new VueRouter({
        routes,
        mode: 'history'
    })
    // 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    // to将要访问的路径
    // from从哪跳转
    // next是一个函数表示放行
    if (to.path === '/login') return next()
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()

})
export default router