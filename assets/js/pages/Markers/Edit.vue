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
                    <form method="POST" @submit.prevent="submit">
                        <!-- NAME -->
                        <div class="mb-4" :class="{ 'has-error': errors.has('name') }">
                            <label class="label mb-2 px-4">Nom</label>
                            <input type="text" class="input" v-model="form.name">
                            <p class="mt-2 px-4 text-xs text-red" v-if="errors.has('name')">{{ errors.get('name').first() }}</p>
                        </div>
                        <!-- DESCRIPTION -->
                        <div class="mb-4" :class="{ 'has-error': errors.has('description') }">
                            <label class="label mb-2 px-4">Description</label>
                            <textarea class="input rounded-xl" v-model="form.description"></textarea>
                            <p class="mt-2 px-4 text-xs text-red" v-if="errors.has('description')">{{ errors.get('description').first() }}</p>
                        </div>
                        <div>
                            <p class="label mb-2 px-4">Photos</p>
                            <div class="flex flex-wrap -m-2">
                                <div class="p-2" v-for="photo in marker.photos" :key="photo.id">
                                    <div class="w-1/2 h-32 bg-grey"></div>
                                </div>
                            </div>
                        </div>
                        <!-- BUTTON -->
                        <div class="fixed pin-x pin-b flex justify-center mb-4">
                            <button class="button is-green">Sauvegarder</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import collect from 'collect.js'
    import { mapGetters } from 'vuex'

    export default {
        name: 'ProjectShow',
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