<template>
    <div class="container mx-auto">
        <div class="flex justify-center">
            <div class="w-full sm:w-3/4 md:w-1/2">
                <div class="flex flex-col px-4 md:px-8">
                    <div class="flex items-center mb-4">
                        <p class="py-4 font-medium">{{ user.name }}</p>
                        <button class="ml-auto p-4 text-grey-darker" title="Déconnexion" @click.prevent>
                            <i class="fas fa-power-off"></i>
                        </button>
                    </div>
                    <div class="flex items-center mb-4">
                        <p class="label text-grey-dark">Projets</p>
                    </div>
                    <div class="mb-8" v-for="project in projects" :key="project.id">
                        <router-link :to="{ name: 'projects.show', params: { id: project.id } }">
                            <div class="card p-4">
                                <p class="uppercase font-medium">{{ project.name }} <span class="text-xs text-grey-dark">&ndash; {{ project.department }}</span></p>
                                <p class="text-xs leading-normal text-grey-dark">{{ project.created_at.format('DD/MM/YYYY') }}</p>
                            </div>
                        </router-link>
                    </div>
                    <div class="absolute pin-x pin-b flex justify-center pb-4">
                        <button class="button is-blue">
                            <span class="mr-2">
                                <i class="fas fa-plus"></i>
                            </span>
                            <span>Chantier</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'

    export default {
        name: 'Project',
        computed: {
            ...mapGetters(['user', 'projects'])
        }
    }
</script>