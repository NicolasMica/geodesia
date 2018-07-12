import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import Releve from './stores/Releve'
import Chantier from './stores/Chantier'

Vue.use(Vuex)

const api = axios.create({
    baseURL: window.Api.path,
    headers: {
        // 'X-Requested-With': 'XMLHttpRequest',
        // 'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content
    }
})

const store = new Vuex.Store({
    namespaced: true,
    modules: {
        releve: Releve,
        chantier : Chantier,
    }
});
export default store