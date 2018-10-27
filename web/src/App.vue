<template>
    <div id="app">

        <background></background>
        <div class="page">
            <div id="nav">
                <word class="title" word="Wordout"></word>
            </div>
            <router-view/>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';

    import Background from './components/background.vue';
    import Word from './components/word.vue';

    @Component({
        components: {
            Background,
            Word
        }
    })
    export default class AppComponent extends Vue {
    }
</script>

<style lang="scss">
    @import "./css/_variables.scss";
    html {
        background: $primary;
        font-family: Helvetica, Arial, sans-serif;
    }

    .title {
        margin-top: 55px;
    }

    .page {
        width: 100vw;
        height: 100vh;
        left: 0;
        top: 0;
        position: absolute;
    }
</style>
