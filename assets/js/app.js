import Vue from 'vue'
import axios from 'axios'
import App from './components/App.vue'
import router from './router'
import store from './store'

require('ol/ol.css');

const objectToFormData = (obj, form, namespace) => {
    let fd = form || new FormData()
    let formKey

    for(let property in obj) {
        if(obj.hasOwnProperty(property)) {

            if(namespace) {
                formKey = namespace + '[' + property + ']'
            } else {
                formKey = property
            }

            // if the property is an object, but not a File,
            // use recursivity.
            if(typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
                objectToFormData(obj[property], fd, property)
            } else {
                // if it's a string or a File object
                fd.append(formKey, obj[property])
            }
        }
    }

    return fd;
}

document.addEventListener('deviceready', () => {

    window.events = new Vue

    window.axios = axios.create({
        baseURL: window.Api.path,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content
        },
        transformResponse: [
            (data, headers) => {
                headers['Content-Type'] = 'multipart/form-data'

                return objectToFormData(data)
            }
        ],
        auth: window.Api.auth,
        withCredentials: true
    })

    const app = new Vue({
        components: { App },
        el: '#root',
        router,
        store,
        template: '<App/>'
    })

}, false);