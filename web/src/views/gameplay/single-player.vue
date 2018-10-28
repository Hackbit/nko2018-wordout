<template>
    <div class="home">
        <box v-if="hasEnded">
            <h1>Times Up!</h1>
            <p>
                You scored {{points}} points in total!
                Words per minute: {{ wpm }}
            </p>

            <ui-button @click="startGame()">Start Game</ui-button>
        </box>

        <box v-if="!isInGame && !hasEnded">
            <h5>How to play</h5>
            <p>Click the start game button and look for the letter at the top of the screen. Type words (and submit with enter) that begin with that letter. Once the times up it's over!</p>
            <p>Earn points based on the longer the word and how common it is</p>
            <h5>Settings</h5>
            <label>Game Duration (seconds)</label>
            <ui-input :value="time" type="number" @change="time = $event.target.value" />
            <ui-button @click="startGame()">Start Game</ui-button>
        </box>

        <div v-if="isInGame">
            <div class="stats">
                <points :points="points" />
                <div class="letter"><word :word="letter" /></div>
                <timer :time="time" ref="timer" />
            </div>
            <word-ticker :words="words" />

            <word-input class="input" @change="checkWord($event)" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.stats {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    flex-basis: 90px;
    justify-content: space-between;

    & > * {
        max-width: 90px;
        flex-grow: 1;
    }
}

label {
    margin-bottom: 5px;
    font-weight: bold;
}
</style>


<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import { api } from '../../services/api';

    import { IWord } from '../../utils/word.types';
    import Points from '../../components/points.vue';
    import UiButton from '../../components/ui-button.vue';
    import UiInput from '../../components/ui-input.vue';
    import Timer from '../../components/timer.vue';
    import WordInput from '../../components/word-input.vue';
    import WordTicker from '../../components/word-ticker.vue';
    import Word from '../../components/word.vue';
    import Box from '../../components/box.vue';

    @Component({
        components: {
            Points,
            UiButton,
            WordInput,
            Timer,
            Word,
            WordTicker,
            Box,
            UiInput,
        }
    })
    export default class SinglePlayerGame extends Vue {
        public time: number = 60;
        public words: IWord[] = [];
        public isInGame: boolean = false;
        public hasEnded: boolean = false;

        public points: number = 0;
        public letter: string = "";
        public count: number = 0;
        public timeLeft: number = 0;

        get wpm(): number {
            return this.words.length / (this.time / 60);
        }

        public startGame() {
            api.startGame(this.time).then(({ letter, count }) => {
                this.isInGame = true;
                this.letter = letter.toUpperCase();
                this.count = count;
                this.timeLeft = this.time;

                this.points = 0;
                this.words = [];
                this.hasEnded = false;
            });

            api.onGameEnd(() => {
                this.isInGame = false;
                this.hasEnded = true;
            });
        }


        public checkWord(word: string) {
            if (!this.isInGame) {
                return;
            }

            const item: IWord = {
                word,
                isDuplicated: false,
                isValid: null,
                points: 0,
            };
            this.words.push(item);

            api.submitWord(word).then((resp) => {
                this.points = resp.points;
                item.isDuplicated = resp.isDuplicated;
                item.isValid = resp.isValid;
                item.points = resp.wordPoints;
            });
        }
    }
</script>
