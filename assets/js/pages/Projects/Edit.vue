<template>
    <div class="container mx-auto">
        <div class="flex justify-center">
            <div class="w-full sm:w-3/4 md:w-1/2">
                <div class="relative flex flex-col px-4 md:px-8 min-h-screen">
                    <div class="flex items-center text-grey-dark" :class="{ 'mb-4': !showMap }">
                        <router-link :to="{ name: 'projects.index' }" class="p-4">
                            <i class="fas fa-arrow-left"></i>
                        </router-link>
                        <p class="ml-auto py-4 uppercase font-medium text-black">Edition de chantier</p>
                    </div>
                    <div v-show="!showMap">
                        <div class="flex justify-center">
                            <button type="button" class="button is-blue mb-4" @click="showMap = true">
                                <span>Voir la carte</span>
                                <span class="ml-2">
                                    <i class="fas fa-map-marked-alt"></i>
                                </span>
                            </button>
                        </div>
                        <project-form :project="project"></project-form>
                    </div>
                    <div class="relative -mx-4 md:-mx-8 bg-black flex-1" v-if="showMap">
                        <roadwork-map :enable-markers="true" :project="project" action="edit"></roadwork-map>
                        <button class="button absolute pin-t pin-r m-4 p-4 bg-white" @click="showMap = false">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import ProjectForm from './Form.vue'
    import RoadworkMap from '../../components/Map.vue'

    export default {
        name: 'ProjectEdit',
        components: { ProjectForm, RoadworkMap },
        props: ['id'],
        data () {
            return {
                loading: false,
                showMap: false
            }
        },
        computed: {
            ...mapGetters(['projects']),

            /**
             * Current project
             */
            project () {
                return this.projects.where('id', this.id).first()
            }
        },
        methods: {
            ...mapActions(['fetchProject']),

            /**
             * Fetch the project
             */
            fetch () {
                this.loading = false
                this.fetchProject(this.id)
                    .then(() => this.loading = false)
            }
        },
        created () {
            this.fetch()
        }
    }
</script>