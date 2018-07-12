<template>
    <form method="POST" @submit.prevent="submit">
        <!-- NAME -->
        <div class="mb-4" :class="{ 'has-error': errors.has('name') }">
            <label class="label mb-2 px-4">Nom</label>
            <input type="text" class="input" v-model="form.name">
            <p class="mt-2 px-4 text-xs text-red" v-if="errors.has('name')">{{ errors.get('name')[0] }}</p>
        </div>
        <!-- DESCRIPTION -->
        <div class="mb-4" :class="{ 'has-error': errors.has('description') }">
            <label class="label mb-2 px-4">Description</label>
            <textarea class="input rounded-xl" v-model="form.description"></textarea>
            <p class="mt-2 px-4 text-xs text-red" v-if="errors.has('description')">{{ errors.get('description')[0] }}</p>
        </div>
        <!-- DEPARTMENT -->
        <div class="mb-4" :class="{ 'has-error': errors.has('department') }">
            <label class="label mb-2 px-4">Département</label>
            <input type="text" class="input" v-model="form.department">
            <p class="mt-2 px-4 text-xs text-red" v-if="errors.has('department')">{{ errors.get('department')[0] }}</p>
        </div>
        <!-- REFERENT -->
        <div class="mb-8" :class="{ 'has-error': errors.has('referent') }">
            <label class="label mb-2 px-4">Référent</label>
            <input type="text" class="input" v-model="form.referent">
            <p class="mt-2 px-4 text-xs text-red" v-if="errors.has('referent')">{{ errors.get('referent')[0] }}</p>
        </div>
        <div class="flex justify-center mb-4">
            <button class="button is-green" :disabled="loading || errors.isNotEmpty()">
                <span class="mr-2" v-if="loading">
                    <i class="fas fa-spin fa-spinner"></i>
                </span>
                <span v-else>{{ exists ? 'Sauvegarder' : 'Suivant' }}</span>
            </button>
        </div>
    </form>
</template>

<script>
    import collect from 'collect.js'
    import { mapActions } from 'vuex'

    export default {
        name: 'ProjectForm',
        props: {
            project: {
                type: Object,
                default: null
            }
        },
        data () {
            return {
                form: null,
                errors: collect({}),
                loading: false
            }
        },
        computed: {
            /**
             * Determines whether the current project already exists
             */
            exists () {
                return this.project !== null
            }
        },
        methods: {
            ...mapActions(['storeProject', 'updateProject']),

            /**
             * Submits the form
             */
            submit () {
                if (this.loading || this.errors.isNotEmpty()) return

                this.loading = true

                let data = { ...this.project, ...this.form }
                this.$emit('submit', data)

                if (!this.exists) return

                this.updateProject(data)
                    .catch(({ message, errors }) => {
                        this.errors = collect(errors)
                        this.loading = false
                    })
                    .then(
                        () => this.loading = false
                    )
            },

            /**
             * Resets the form
             */
            reset () {
                this.form = {
                    name: null,
                    description: null,
                    department: null,
                    referent: null
                }
            }
        },
        created () {
            if (this.exists) {
                this.form = this.project
            } else {
                this.reset()
            }
        }
    }
</script>