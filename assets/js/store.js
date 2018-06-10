import Vue from 'vue'
import Vuex from 'vuex'
import Releve from './stores/Releve'
import Chantier from './stores/Chantier'
Vue.use(Vuex)

const store = new Vuex.Store({
    namespaced: true,
    modules: {
        releve: Releve,
        chantier : Chantier,
    }
});
export default store