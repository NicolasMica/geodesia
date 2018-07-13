<template>
    <div class="container mx-auto">
        <div class="flex justify-center">
            <div class="w-full sm:w-3/4 md:w-1/2">
                <div class="flex flex-col px-4 md:px-8">
                    <div class="flex items-center mb-4 text-grey-dark">
                        <router-link :to="{ name: 'projects.edit', params: { id: project_id } }" class="p-4">
                            <i class="fas fa-arrow-left"></i>
                        </router-link>
                        <p class="ml-auto py-4 uppercase font-medium text-black">Edition de marker</p>
                    </div>
                    <marker-from :marker="marker"></marker-from>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import collect from 'collect.js'
    import { mapGetters } from 'vuex'
    import MarkerForm from './Form.vue'

    export default {
        name: 'ProjectEdit',
        components: { MarkerForm },
        props: ['project_id', 'marker_id'],
        data () {
            return {
                form: null,
                errors: collect({})
            }
        },
        computed: {
            ...mapGetters(['projects']),

            /**
             * Current project
             * @return {T | undefined}
             */
            project () {
                return this.projects.find(project => project.id == this.project_id)
            },

            /**
             * Current marker
             * @return {*}
             */
            marker () {
                return this.project.markers.find(marker => marker.id == this.marker_id)
            }
        },
        methods: {
            submit () {

            },

            reset () {
                this.form = {
                    id: null,
                    name: null,
                    description: null,
                    latitude: null,
                    longitude: null
                }
            }
        },
        created () {
            this.form = this.marker
            if (this.form === undefined) this.reset()
        }
    }
</script>