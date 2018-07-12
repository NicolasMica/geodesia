<template>
    <div class="container mx-auto">
        <div class="flex justify-center">
            <div class="w-full sm:w-3/4 md:w-1/2">
                <div class="flex flex-col px-4 md:px-8">
                    <div class="flex items-center mb-4">
                        <p class="py-4 font-medium">{{ user.name }}</p>
                        <button class="ml-auto p-4 text-grey-darker" title="Déconnexion" @click.prevent="logout">
                            <i class="fas fa-power-off"></i>
                        </button>
                    </div>
                    <div class="flex items-center text-grey-dark mb-4">
                        <p class="label text-grey-dark">Projets</p>
                        <button type="button" class="p-2 ml-auto transition-transform focus:outline-none" :class="{ 'rotate-360': loading }" @click="fetch">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    <div class="mb-16">
                        <div class="mb-8" v-for="project in projects.all()" :key="project.id">
                            <router-link :to="{ name: 'projects.edit', params: { id: project.id } }">
                                <div class="card p-4">
                                    <div class="flex items-center">
                                        <p class="uppercase font-medium">{{ project.name }} <span class="text-xs text-grey-dark">&ndash; {{ project.created_at.format('DD/MM/YYYY') }}</span></p>
                                        <button type="button" class="ml-auto p-2 text-grey hover:text-red" @click.prevent.stop="destroy(project)">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                    <p class="text-xs leading-normal text-grey-dark">Département: {{ project.department }}</p>
                                </div>
                            </router-link>
                        </div>
                    </div>
                    <div class="fixed pin-x pin-b flex justify-center pb-4">
                        <router-link :to="{ name: 'projects.create' }" class="button is-blue">
                            <span class="mr-2">
                                <i class="fas fa-plus"></i>
                            </span>
                            <span>Chantier</span>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'

    export default {
        name: 'Project',
        data () {
            return {
                loading: false
            }
        },
        computed: {
            ...mapGetters(['user', 'projects'])
        },
        methods: {
            ...mapActions(['fetchProjects', 'destroyProject']),

            logout () {
                this.$router.push({ name: 'login' })
            },

            destroy (project) {
                let modal = confirm("Êtes-vous sûr de vouloir supprimer ce chantier ainsi que tous ses marqueurs ?")
                if (!modal) return false

                this.loading = true
                this.destroyProject(project)
                    .then(() => this.loading = false)
            },

            /**
             * Fetches the projects
             */
            fetch () {
                if (this.loading) return

                this.loading = true
                this.fetchProjects()
                    .then(() => this.loading = false)
            }
        },
        created () {
            this.fetch()
        }
    }
</script>