<template>
    <div class="container mx-auto">
        <div class="flex justify-center">
            <div class="w-full sm:w-3/4 md:w-1/2">
                <div class="flex flex-col px-4 md:px-8">
                    <div class="flex items-center mb-4 text-grey-dark">
                        <router-link :to="{ name: 'projects.index' }" class="p-4">
                            <i class="fas fa-arrow-left"></i>
                        </router-link>
                        <p class="ml-auto py-4 uppercase font-medium text-black">Création de chantier</p>
                    </div>
                    <project-form></project-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import ProjectForm from './Form.vue'

    export default {
        name: 'ProjectEdit',
        components: { ProjectForm }
    }
</script>