<template>
    <div class="container mx-auto">
        <div class="flex justify-center">
            <div class="w-full sm:w-3/4 md:w-1/2">
                <div class="flex flex-col px-4 md:px-8">
                    <div class="flex items-center mb-4 text-grey-dark">
                        <router-link :to="{ name: 'projects.edit', params: { id: project_id } }" class="p-4">
                            <i class="fas fa-arrow-left"></i>
                        </router-link>
                        <p class="ml-auto py-4 uppercase font-medium text-black">Création de marker</p>
                    </div>
                    <marker-form :project="project"></marker-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import MarkerForm from './Form.vue'

    export default {
        name: 'ProjectCreate',
        components: { MarkerForm },
        props: ['project_id'],
        computed: {
            ...mapGetters(['projects']),

            /**
             * Current project
             * @return {T | undefined}
             */
            project () {
                return this.projects.where('id', this.project_id).first()
            }
        }
    }
</script>