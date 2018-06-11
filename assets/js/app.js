import Vue from 'vue'
import App from './components/App.vue'
import router from './router'
import store from './store'
import 'materialize-css/dist/js/materialize.min'
import 'materialize-css/dist/css/materialize.min.css'

document.addEventListener('deviceready', () => {

    window.events = new Vue

    const app = new Vue({
        components: { App },
        el: '#root',
        router,
        store,
        template: '<App/>'
    })

}, false);