<template>
    <div class="container mx-auto">
        <div class="flex justify-center">
            <div class="w-full sm:w-3/4 md:w-1/2">
                <div class="relative flex flex-col px-4 md:px-8 min-h-screen">
                    <div class="flex items-center text-grey-dark" :class="{ 'mb-4': !hasData }">
                        <router-link :to="{ name: 'projects.index' }" class="p-4">
                            <i class="fas fa-arrow-left"></i>
                        </router-link>
                        <p class="ml-auto py-4 uppercase font-medium text-black">Création de chantier</p>
                    </div>
                    <project-form @submit="onSubmit" v-if="!hasData"></project-form>
                    <div class="relative -mx-4 md:-mx-8 h-full bg-black flex-1" v-if="hasData">
                        <roadwork-map @update="onMapUpdate" action="create"></roadwork-map>
                        <div class="fixed pin-b pin-x flex justify-center py-4 pointer-events-none">
                            <button class="button is-green pointer-events-auto" @click="submit" :disabled="loading">
                                <span v-show="!loading">Terminer</span>
                                <span v-show="loading">
                                    <i class="fas fa-spinner fa-spin"></i>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions } from 'vuex'
    import ProjectForm from './Form.vue'
    import RoadworkMap from '../../components/Map.vue'

    export default {
        name: 'ProjectCreate',
        components: { ProjectForm, RoadworkMap },
        data () {
            return {
                project: null,
                loading: false
            }
        },
        computed: {
            hasData () {
                return this.project !== null
            }
        },
        methods: {
            ...mapActions(['storeProject']),

            /**
             * Trigger submission
             */
            submit () {
                window.events.$emit('map:coords')
            },

            /**
             * Handle form submit
             */
            onSubmit (data) {
                this.project = data
            },

            /**
             * Update the project coords
             * @param coords
             */
            onMapUpdate (coords) {
                if (this.loading) return

                this.project = { ...this.project, ...coords }

                this.loading = true
                this.storeProject(this.project)
                    .then(project => this.$router.push({
                        name: 'projects.edit',
                        params: {
                            id: project.id
                        }
                    }))
                    .catch(console.error)
                    .then(() => this.loading = false)
            }
        }
    }
</script>