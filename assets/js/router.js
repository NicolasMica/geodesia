import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

import Releve from './components/Releve'
import Home from './pages/Home.vue'

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Releve',
            component: Releve
        },
        {
            path: '/mockup',
            name: 'Home',
            component: Home
        }
    ]
})