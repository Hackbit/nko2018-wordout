<template>
    <div class="home">
        <box v-if="!isInGame">
            <h5>JOIN GLOBAL CHALLENGE</h5>

            <p>
                The global challenge gives everyone one letter to begin with. The game is reset daily. The game is won by every single word starting with a particular letter being entered.
            </p>

            <ui-button @click="startGame()">JOIN GAME</ui-button>
        </box>

        <div v-if="isInGame">
            <div class="stats">
                <points :points="points" label="WORDS LEFT" />
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
    width: 60%;
    margin-left: auto;
    margin-right: auto;
}

.total-description {
    width: 100%;
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
     font-size: 24px;
 }
</style>


<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import { api, GameType, IAddResponse, IStartResponse } from '../../services/api';

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
    export default class GlobalChallenge extends Vue {
        public time: number = 60;
        public words: IWord[] = [];
        public isInGame: boolean = false;

        public points: number = 0;
        public letter: string = "";
        public count: number = 0;

        private disposers: Function[] = [];

        get wpm(): number {
            return Math.round(this.words.length / (this.time / 60));
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

        public onGameStart({ letter, count, endsIn }: IStartResponse) {
            this.isInGame = true;
            this.letter = letter.toUpperCase();
            this.count = count;
            this.time = endsIn;

            this.points = count;
            this.words = [];
        }


        public startGame() {
            api.startGame(GameType.GLOBAL, 0).then((res) => this.onGameStart(res));

            this.disposers.push(api.onGameStart((res) => this.onGameStart(res)));

            this.disposers.push(api.onWordAdded((word) => {
                this.words.push({
                    word: word.word,
                    isCommon: word.isCommon,
                    isDuplicated: word.isDuplicated,
                    isValid: word.isValid,
                    points: word.wordPoints,
                    isMe: word.isMe,
                });

                // TODO: Eventually fix this awful typings.
                this.points = word.points as number;
            }));

            this.disposers.push(api.onGameEnd(() => {
                this.isInGame = false;
            }));
        }

        public destroyed() {
            this.disposers.forEach((fn) => fn());
            api.leave();
        }

        public checkWord(word: string) {
            if (!this.isInGame) {
                return;
            }

            api.submitWord(word);
        }
    }
</script>
