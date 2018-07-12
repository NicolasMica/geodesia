import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'
import axios from 'axios'
import collect from 'collect.js'

Vue.use(Vuex)

const api = axios.create({
    baseURL: window.Api.path,
    headers: {
        // 'X-Requested-With': 'XMLHttpRequest',
        // 'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content
    }
})

const store = new Vuex.Store({
    state: {
        user: {
            id: 1,
            email: 'john@doe.com',
            name: 'John Doe'
        },
        projects: collect([])
    },
    mutations: {
        /**
         * Set the projects state
         * @param state - Store state
         * @param projects - Project collection
         * @return {*}
         */
        FETCH_PROJECTS: (state, projects)  => state.projects = projects,

        /**
         * Store a new project in the state
         * @param state - Store state
         * @param project - Project entity
         * @return {number}
         */
        STORE_PROJECT: (state, project) => state.projects.push(project),

        /**
         * Update a given project in the state
         * @param state - Store state
         * @param project - Project entity
         * @return {*}
         */
        UPDATE_PROJECT: (state, project) => state.projects.transform(entity => entity.id === project.id ? entity : entity),

        /**
         * Remove a given project from the state
         * @param state - Store state
         * @param project - Project entity
         * @return {*}
         */
        DESTROY_PROJECT: (state, project) => state.projects = state.projects.filter(entity => entity.id !== project.id)
    },
    actions: {
        /**
         * Fetches the projects
         * @param store
         */
        fetchProjects (store) {
            return new Promise((resolve, reject) => {
                api.get('/roadworks')
                    .then(response => {
                        store.commit('FETCH_PROJECTS', response.data)
                        resolve()
                    })
                    .catch(error => {
                        console.error(error)
                        reject(error)
                    })
            })
        },

        /**
         * Fetch a given project
         * @param store
         * @param projectId - Project primary key
         */
        fetchProject (store, projectId) {
            return new Promise((resolve, reject) => {
                api.get(`/roadworks/${projectId}`)
                    .then(response => {
                        store.commit('UPDATE_PROJECT', response.data)
                        resolve()
                    })
                    .catch(error => {
                        console.error(error)
                        reject(error)
                    })
            })
        },

        /**
         * Stores a new project
         * @param store
         * @param project - Project form
         */
        storeProject (store, project) {
            return new Promise((resolve, reject) => {
                api.post('/roadworks', project)
                    .then(response => {
                        store.commit('STORE_PROJECT', response.data)
                        resolve()
                    })
                    .catch(error => {
                        console.error(error)
                        reject(error)
                    })
            })
        },

        /**
         * Update a given project
         * @param store
         * @param project - Project entity
         */
        updateProject (store, project) {
            return new Promise((resolve, reject) => {
                api.patch(`/roadworks/${project.id}`, project)
                    .then(response => {
                        store.commit('UPDATE_PROJECT', response.data)
                        resolve()
                    })
                    .catch(error => {
                        console.error(error.message)
                        reject(error.message)
                    })
            })
        },

        /**
         * Destroy a givben project
         * @param store
         * @param project - Project entity
         */
        destroyProject (store, project) {
            return new Promise((resolve, reject) => {
                api.delete(`/roadworks/${project.id}`)
                    .then(response => {
                        store.commit('DESTROY_PROJECT', project)
                        resolve()
                    })
                    .catch(error => {
                        console.error(error)
                        reject(error)
                    })
            })
        }
    },
    getters: {
        /**
         * Logged user getter
         * @param state
         * @return {*}
         */
        user (state) {
            return state.user
        },

        /**
         * Project getter
         * @param state
         * @return {*[]}
         */
        projects (state) {
            return state.projects.map(project => {
                project.created_at = moment(project.created_at)
                return project
            })
        }
    }
})

export default store