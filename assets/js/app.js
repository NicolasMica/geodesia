import Vue from 'vue'

document.addEventListener('deviceready', () => {

    window.events = new Vue

    const app = new Vue({
        el: '#root',
        template: '<App/>'
    })

}, false);