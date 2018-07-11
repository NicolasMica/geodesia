<template>
    <div class="relative flex flex-col justify-center w-screen min-h-screen bg-grey-lightest">
        <div class="flex items-center absolute z-0 pin">
            <svg class="w-screen fill-current text-blue" viewBox="0 0 43 32">
                <use xlink:href="/img/sprite.svg#background"></use>
            </svg>
        </div>
        <div class="relative z-10 w-full flex items-center justify-center px-8">
            <div class="container">
                <div class="flex justify-center">
                    <div class="w-full sm:w-3/4 md:w-1/2">
                        <form method="POST" autocomplete="off" @submit.prevent="submit">
                            <div class="relative mb-8">
                                <span class="absolute pin-l pin-t px-4 py-4 pointer-events-none text-grey">
                                    <i class="fas fa-user"></i>
                                </span>
                                <input type="email" name="email" v-model="form.email" placeholder="Adresse e-mail" class="input pl-10">
                            </div>
                            <div class="relative mb-8">
                                <span class="absolute pin-l pin-t px-4 py-4 pointer-events-none text-grey">
                                    <i class="fas fa-key"></i>
                                </span>
                                <input type="password" name="password" v-model="form.password" placeholder="Mot de passe" class="input pl-10">
                            </div>
                            <div class="flex">
                                <button type="submit" class="button is-green mx-auto">Connexion</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Home',
        data () {
            return {
                form: {
                    email: null,
                    password: null
                }
            }
        },
        methods: {
            submit (event) {
                this.$router.push({ name: 'projects.index' })
            }
        }
    }
</script>