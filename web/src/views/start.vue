<template>
  <div class="home">
      <word class="title" word="Wordout"></word>
      <div class="actions">
          <ui-button to="/game/single-player">SINGLE PLAYER</ui-button>
          <ui-button to="/game/two-player">2 PLAYER</ui-button>
          <ui-button>GLOBAL CHALLENGE</ui-button>
          <ui-button>ACHIEVEMENTS</ui-button>
      </div>
  </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import Word from '../components/word.vue';
    import UiButton from '../components/ui-button.vue';

    @Component({
      components: {
          Word,
          UiButton,
      },
    })
    export default class Start extends Vue {}
</script>

<style lang="scss" scoped>
    @import "../css/_variables.scss";

    .home {
        height: 100vh;
    }

    .title {
        padding-top: 55px;
    }

    .actions {
        left: 50%;
        top: 40%;
        transform: translate(-50%, -50%);
        width: 320px;
        position: relative;
        padding: 20px;
        display: flex;
        flex-direction: column;
    }
</style>
