<template>
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
        <!-- BUTTON -->
        <div class="flex justify-center mb-4">
            <button class="button is-green">Sauvegarder</button>
        </div>
    </form>
</template>

<script>
    import collect from 'collect.js'
    import { mapActions, mapGetters } from 'vuex'

    export default {
        name: 'MarkerForm',
        props: {
            marker: {
                type: Object,
                default: null
            },
            project: {
                type: Object,
                required: true
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
            ...mapGetters({ item: 'marker' }),

            /**
             * Determines whether the current project already exists
             */
            exists () {
                return this.marker !== null
            }
        },
        methods: {
            ...mapActions(['storeMarker', 'updateMarker']),

            /**
             * Submits the form
             */
            submit () {
                if (this.loading || this.errors.isNotEmpty()) return

                this.loading = true

                let data = { ...this.marker, ...this.item, ...this.form, roadwork_id: this.project.id }
                this.$store.state.marker = null
                let process = this.exists ? this.updateMarker(data) : this.storeMarker(data)

                process
                    .then(marker => {
                        this.$router.push({
                            name: 'projects.edit',
                            params: {
                                id: marker.roadwork_id
                            }
                        })
                    })
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
                    description: null
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