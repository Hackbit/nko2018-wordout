<template>
    <div class="home">
        <box v-if="hasEnded">
            <div>
                <h1 v-if="points > theirPoints">YOU WIN!</h1>
                <h1 v-if="points < theirPoints">YOU LOSE!</h1>
                <h1 v-if="points === theirPoints">YOU WIN!</h1>
                <div class="total-description">YOUR POINTS</div>
                <word class="total" :word="points.toString()" />
                <br />
                <div class="total-description">THEIR POINTS</div>
                <word class="total" :word="theirPoints.toString()" />

                <table>
                    <tbody>
                        <tr>
                            <th>Words</th>
                            <td>{{validWords}}</td>
                        </tr>

                        <tr>
                            <th>Combined WPM</th>
                            <td>{{wpm}}</td>
                        </tr>

                        <tr>
                            <th>Common Words</th>
                            <td>{{commonWords}}</td>
                        </tr>


                        <tr v-if="bestWord">
                            <th>Best Word Player</th>
                            <td>{{bestWord.isMe ? "YOU" : "THEM" }}</td>
                        </tr>

                        <tr v-if="bestWord">
                            <th>Best Word</th>
                            <td>{{bestWord.word}} (+{{bestWord.points}})</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <ui-button :isDisabled="!canRematch || waitingRematch" @click="rematch()">Re-match <timer v-if="canRematch" :time="30"><span slot-scope="{ timeLeft }">Waiting for {{timeLeft}}</span></timer></ui-button>
            <ui-button to="/">Main Menu</ui-button>
        </box>

        <box v-if="!isInGame && !hasEnded">
            <h5>How to play</h5>
            <p>Click the start game button and look for the letter at the top of the screen. Type words (and submit with enter) that begin with that letter. Once the times up it's over!</p>
            <p>Earn points based on the longer the word and how common it is</p>

            <h5>JOIN GAME</h5>

            <ui-input v-model="joinKey" placeholder="ENTER KEY" />
            <ui-button :isDisabled="joinKey && this.isJoinKeySameAsHost" @click="startGame(joinKey)">JOIN GAME</ui-button>

            <h5>HOST GAME</h5>
            <p v-if="hostKey">Tell your friend to enter the following:</p>
            <br />
            <ui-input :value="(hostKey || '').toUpperCase()" disabled placeholder="CREATE GAME FOR KEY" />

            <ui-button :isDisabled="!!hostKey"  @click="startGame()">{{ hostKey ? 'WAITING FOR PARTNER' : 'CREATE GAME' }}</ui-button>
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
    padding: 10px;
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
    import { api, GameType, IAddResponse } from '../../services/api';

    import { IWord } from '../../utils/word.types';
    import Points from '../../components/points.vue';
    import UiButton from '../../components/ui-button.vue';
    import UiInput from '../../components/ui-input.vue';
    import Timer from '../../components/timer.vue';
    import WordInput from '../../components/word-input.vue';
    import WordTicker from '../../components/word-ticker.vue';
    import Word from '../../components/word.vue';
    import Box from '../../components/box.vue';

    import { sound } from '@/services/sound';

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
    export default class TwoPlayerGame extends Vue {
        public time: number = 60;
        public words: IWord[] = [];
        public isInGame: boolean = false;
        public hasEnded: boolean = false;

        public points: number = 0;
        public theirPoints: number = 0;
        public letter: string = "";
        public count: number = 0;
        public timeLeft: number = 0;

        public isHost: boolean = false;

        public hostKey: string = '';
        public joinKey: string = '';

        public canRematch: boolean = true;
        private disposers: Function[] = [];

        private knownKey: string = '';
        private rematchTimer: any = null;
        private waitingRematch: boolean = false;

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

        get isJoinKeySameAsHost(): boolean {
            const hostKey = this.hostKey
            if (!!this.joinKey && this.joinKey.toUpperCase() === this.hostKey.toUpperCase()) {
                return true;
            }
            return false;
        }

        public rematch() {
            this.waitingRematch = true;
            api.startGame(GameType.MULTI, this.time, this.knownKey);

            const timer = setTimeout(() => {
                api.leave();
            }, 30000);
            this.rematchTimer = timer;
            this.disposers.push(() => clearTimeout(timer));
        }

        public startGame(key: string|null = null) {
            console.log('The key is ', key, typeof key, this.isJoinKeySameAsHost);
            if (key === "" || (key === null && this.hostKey) || (key && this.isJoinKeySameAsHost)) {
                return;
            }

            this.knownKey = key || '';

            api.startGame(GameType.MULTI, this.time, key || null).then((resp) => {
                console.log('Game Started', resp);
                 this.hostKey = resp.key;
                 this.knownKey = resp.key;
            });

            this.disposers.push(api.onGameStart(({ letter, count }) => {
                clearTimeout(this.rematchTimer);
                this.isInGame = true;
                this.waitingRematch = false;
                this.letter = letter.toUpperCase();
                this.count = count;
                this.timeLeft = this.time;

                this.points = 0;
                this.words = [];
                this.hasEnded = false;

                this.isHost = !key;
            }));

            this.disposers.push(api.onWordAdded((word) => {
                if (word.isValid && !word.isDuplicated && word.isMe) {
                    sound.play('valid');
                }
                this.words.push({
                    word: word.word,
                    isCommon: word.isCommon,
                    isDuplicated: word.isDuplicated,
                    isValid: word.isValid,
                    points: word.wordPoints,
                    isMe: word.isMe,
                });

                // TODO: Eventually fix this awful typings.
                this.setPoints(word.points as any);
            }));

            this.disposers.push(api.onGameEnd(() => {
                this.isInGame = false;
                this.hasEnded = true;
                this.canRematch = true;

                setTimeout(() => this.canRematch = false, 30000);
            }));
        }

        public destroyed() {
            this.disposers.forEach((fn) => fn());
            api.leave();
        }

        public setPoints(players: Array<{ isHost: boolean, points: number }>) {
            // Can you tell there is not long left...
            const me = players.find(({isHost}) => isHost === this.isHost)!;
            const them = players.find(({isHost}) => isHost !== this.isHost)!;

            this.points = me.points;
            this.theirPoints = them.points;
        }

        public checkWord(word: string) {
            if (!this.isInGame) {
                return;
            }

            api.submitWord(word);
        }
    }
</script>
