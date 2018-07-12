import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Releve from './components/Releve'
import Login from './pages/Auth/Login.vue'
import ProjectIndex from './pages/Projects/Index.vue'
import ProjectCreate from './pages/Projects/Create.vue'
import ProjectEdit from './pages/Projects/Edit.vue'
import MarkerEdit from './pages/Markers/Edit.vue'

export default new Router({
    routes: [
        {
            path: '/',
            name: 'login',
            component: Login
        },
        {
            path: '/projects',
            name: 'projects.index',
            component: ProjectIndex,
        },
        {
            path: '/projects/create',
            name: 'projects.create',
            component: ProjectCreate,
        },
        {
            path: '/projects/:id/edit',
            name: 'projects.edit',
            component: ProjectEdit,
            props: true
        },
        {
            path: '/projects/:project_id/markers/:marker_id',
            name: 'markers.edit',
            component: MarkerEdit,
            props: true
        },
        {
            path: '/releve',
            name: 'Releve',
            component: Releve
        },
    ]
})