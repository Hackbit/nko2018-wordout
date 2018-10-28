<template>
    <div class="home">
        <box v-if="hasEnded">
            <div>
                <div class="total-description">TOTAL POINTS</div>
                <word class="total" :word="points.toString()" />

                <!-- Feel like I haven't written a table in years -->
                <table>
                    <tbody>
                        <tr>
                            <th>Words</th>
                            <td>{{validWords}}</td>
                        </tr>

                        <tr>
                            <th>WPM</th>
                            <td>{{wpm}}</td>
                        </tr>

                        <tr>
                            <th>Common Words</th>
                            <td>{{commonWords}}</td>
                        </tr>

                        <tr v-if="bestWord">
                            <th>Best Word</th>
                            <td>{{bestWord.word}} (+{{bestWord.points}})</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <ui-button @click="startGame()">Play Again</ui-button>
            <ui-button to="/">Main Menu</ui-button>
        </box>

        <box v-if="!isInGame && !hasEnded">
            <h5>How to play</h5>
            <p>Click the start game button and look for the letter at the top of the screen. Type words (and submit with enter) that begin with that letter. Once the times up it's over!</p>
            <p>Earn points based on the longer the word and how common it is</p>
            <h5>Settings</h5>
            <label>Game Duration (seconds)</label>
            <ui-input :value="time || 60" type="number" @input="time = +$event" />
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

.total, .total-description {
    width: 50%;
    margin-left: auto;
    margin-right: auto;
}

table {
    margin-top: 10px;
    margin-bottom: 10px;
    width: 100%;
    th {

        padding: 5px 0px;
        text-align: left;
        font-weight: bold;
    }
    td {
        text-align: right;
    }
}
 .total-description{
     text-align: center;
     font-size: 30px;
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

        get bestWord(): IWord|null {
            return this.words.reduce<IWord|null>(
                (prev, curr) => prev ? prev.points > curr.points ? prev : curr : curr,
                null,
            );
        }

        get validWords(): number {
            return this.words.filter((word) => word.isValid).length;
        }

        get commonWords(): number {
            return this.words.filter((word) => word.isCommon && word.isValid).length;
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
                isCommon: null,
                isDuplicated: false,
                isValid: null,
                points: 0,
            };
            this.words.push(item);

            api.submitWord(word).then((resp) => {
                this.points = resp.points;
                item.isCommon = resp.isCommon;
                item.isDuplicated = resp.isDuplicated;
                item.isValid = resp.isValid;
                item.points = resp.wordPoints;
            });
        }
    }
</script>
