import Vue from 'vue'
import App from './components/App.vue'

document.addEventListener('deviceready', () => {

    window.events = new Vue

    const app = new Vue({
        components: { App },
        el: '#root',
        template: '<App/>'
    })

}, false);