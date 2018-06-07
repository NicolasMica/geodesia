<template>
    <div id="root" class="min-h-screen min-w-screen antialiased font-sans">
        <example></example>
        <releve></releve>
    </div>
</template>

<script>
    import Example from './Example.vue'
    import Releve from './Releve.vue'
    export default {
        name: 'App',
        components: { Example,Releve }
    }
</script>