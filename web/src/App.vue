<template>
    <div id="app">

        <background></background>
        <div class="page">
            <div class="center" v-if="!isConnected">
                <word class="word--wordout" word="..." />
            </div>
            <router-view v-if="isConnected" />
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';

    import Background from './components/background.vue';
    import Box from './components/box.vue';
    import Word from './components/word.vue';
import { api } from '@/services/api';

    @Component({
        components: {
            Background,
            Box,
            Word,
        }
    })
    export default class AppComponent extends Vue {
        public isConnected: boolean = false;

        public mounted() {
            api.onConnected((isConnected) => {
                if (isConnected === true && !this.isConnected) {
                    // Throw the user out of any game...
                    // TODO: Fix to improve if have more time.
                    this.$router.push('/');
                }

                this.isConnected = isConnected;
            });
        }
    }
</script>

<style lang="scss">
    @import "./css/_variables.scss";
    @import "./css/_reset.scss";

    .center {
        top: 50%;
        left: 50%;
        width: 40%;
        position: absolute;
        transform: translate(-50%, -50%);
    }

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
        max-height: 100vh;
        max-width: 100vw;
        overflow: auto;
        left: 0;
        top: 0;
        position: absolute;
    }

    *, *:before, *:after {
        box-sizing: border-box;
    }
</style>
