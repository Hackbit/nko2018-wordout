<template>
    <div id="app">

        <background></background>
        <div class="page">
            <router-view/>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';

    import Background from './components/background.vue';

    @Component({
        components: {
            Background,
        }
    })
    export default class AppComponent extends Vue {
    }
</script>

<style lang="scss">
    @import "./css/_variables.scss";
    @import "./css/_reset.scss";

    html {
        background: $primary;
        font-family: Helvetica, Arial, sans-serif;
    }

    h5 {
        font-weight: bold;
        font-size: 20px;
        margin-top: 15px;
        margin-bottom: 10px;
    }

    h1 {
        text-align: center;
        font-size: 40px;
        margin-top: 15px;
        margin-bottom: 10px;
    }

    .page {
        width: 100vw;
        height: 100vh;
        left: 0;
        top: 0;
        position: absolute;
    }

    *, *:before, *:after {
        box-sizing: border-box;
    }
</style>
