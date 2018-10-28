<template>
    <div id="app">

        <background></background>
        <div class="page">
            <div class="center" v-if="!isLoaded">
                <p class="loading">Connecting and loading audio... please wait.</p>
                <word class="word--wordout" word="..." />
            </div>
            <router-view v-if="isLoaded" />
            <ui-button class="mute" @click="onMute()" button-class="mute-button" v-if="isLoaded">
                <!--NOT ENOUGH TIME, INLINE SVG. -->
                <svg v-if="isMuted" version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M17.138 5.824c-.449 0-.905.152-1.356.453l-2.672 1.781c-.753.503-2.206.942-3.11.942-1.654 0-3 1.346-3 3v2c0 1.654 1.346 3 3 3 .904 0 2.357.439 3.109.941l2.672 1.781c.451.301.907.453 1.356.453.898.001 1.863-.68 1.863-2.175v-10c0-1.495-.965-2.176-1.862-2.176zm-3.138 10.322c-1.093-.651-2.789-1.146-4-1.146-.552 0-1-.448-1-1v-2c0-.552.448-1 1-1 1.211 0 2.907-.495 4-1.146v6.292zm3 1.854l-.006.12-.104-.062-1.89-1.26v-7.596l1.891-1.261.104-.062.005.121v10z"/></svg>
                <svg v-if="!isMuted" version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19.707 5.293c-.391-.391-1.023-.391-1.414 0l-1.551 1.551c-.345-.688-.987-1.02-1.604-1.02-.449 0-.905.152-1.356.453l-2.672 1.781c-.753.503-2.206.942-3.11.942-1.654 0-3 1.346-3 3v2c0 1.237.754 2.302 1.826 2.76l-1.533 1.533c-.391.391-.391 1.023 0 1.414.195.195.451.293.707.293s.512-.098.707-.293l2.527-2.527c.697.174 1.416.455 1.875.762l2.672 1.781c.451.301.907.453 1.356.453.898 0 1.863-.681 1.863-2.176v-8.586l2.707-2.707c.391-.391.391-1.023 0-1.414zm-4.816 2.648l.104-.062.005.121v1.293l-2 2v-2.091l1.891-1.261zm-7.891 4.059c0-.552.448-1 1-1 1.211 0 2.907-.495 4-1.146v2.439l-2.83 2.83c-.413-.077-.814-.123-1.17-.123-.552 0-1-.448-1-1v-2zm3.301 3.406l1.699-1.699v2.439c-.481-.287-1.075-.542-1.699-.74zm4.693 2.714l-.104-.062-1.89-1.26v-4.091l2-2v7.293l-.006.12z"/></svg>
            </ui-button>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';

    import Background from './components/background.vue';
    import Box from './components/box.vue';
    import Word from './components/word.vue';
    import UiButton from './components/ui-button.vue';
    import { api } from '@/services/api';
    import { sound } from '@/services/sound';

    @Component({
        components: {
            Background,
            Box,
            UiButton,
            Word,
        }
    })
    export default class AppComponent extends Vue {
        public isConnected: boolean = false;
        public hasAudioLoaded: boolean = false;
        public isMuted: boolean = sound.isMuted;

        get isLoaded() {
            return this.isConnected && this.hasAudioLoaded;
        }

        public onMute() {
            sound.toggleMute();
            this.isMuted = sound.isMuted;
        }

        public mounted() {
            sound.addSound('background', true, true, 0.3);
            sound.addSound('click');
            sound.addSound('type');
            sound.addSound('valid');

            sound.load().then(() => {
                console.log('All sounds loaded');
                this.hasAudioLoaded = true;
            });

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

    .mute {
        position: fixed;
        left: 10px;
        bottom: 10px;
        fill: darken($secondary, 30%);
    }
    .mute-button {
        width: 34px !important;
        height: 34px !important;
        padding: 2px !important;
        box-shadow: none !important;
    }
    .center {
        top: 50%;
        left: 50%;
        width: 40%;
        position: absolute;
        transform: translate(-50%, -50%);
    }

    .loading {
        color: white;
        font-weight: bold;
        font-size: 8px;
    }

    #app {
        width: 100vw;
        height: 100vh;
        background: $primary;
        background: radial-gradient(ellipse at center, #{$primary} 0%,#{lighten($primary, 10%)} 100%);

        font-family: 'Josefin Sans', sans-serif;

    }

    h5 {
        font-weight: bold;
        font-size: 20px;
        margin-top: 15px;
        margin-bottom: 10px;
    }

    p {
        margin-top: 10px;
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
