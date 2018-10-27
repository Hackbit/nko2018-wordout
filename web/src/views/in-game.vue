<template>
    <div class="home">
        <div v-if="hasEnded">
            <h1>Times Up!</h1>
            <p>
                You scored {{points}} in total!
                Words per minute: {{ wpm }}
            </p>
        </div>
        <div v-if="!isInGame">
            <button @click="startGame()">Start Game</button>
        </div>
        <div v-if="isInGame">
            <h1>Points: {{points}}</h1>
            <div>{{ timeLeft }}</div>
            <h2>Words starting with {{letter}}</h2>
            <p>In total there are {{count}} words beginning with this letter.</p>
            <input class="input" @keydown.enter="checkWord($event.target.value)" v-model="currentWord" />

            <div class="words">
                <ul>
                    <li v-for="word in words">{{word.word}} (Status: {{ word.isValid === null ? 'Verifying...' : word.isValid }})</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { api } from '../services/api';

    interface IWord {
        isValid: boolean|null;
        isDuplicated: boolean;
        word: string;
    }
    @Component({
    })
    export default class Game extends Vue {
        public time: number = 60;
        public words: IWord[] = [];
        public currentWord: string = '';
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
                this.updateTimer(false);
            });

            api.onGameEnd(() => {
                this.isInGame = false;
                this.hasEnded = true;
            });
        }

        public updateTimer(shouldUpdate: boolean = true) {
            if (!this.hasEnded && this.timeLeft !== 0) {
                setTimeout(() => {
                    this.updateTimer(true);
                }, 1000);
            }

            if (!shouldUpdate || this.timeLeft <= 0) {
                return;
            }

            this.timeLeft--;
        }

        public checkWord(word: string) {
            if (!this.isInGame) {
                return;
            }

            const item: IWord = {
                word,
                isDuplicated: false,
                isValid: null,
            };
            this.words.push(item);
            this.currentWord = '';

            api.submitWord(word).then((resp) => {
                this.points = resp.points;
                item.isDuplicated = resp.isDuplicated;
                item.isValid = resp.isValid;
            });
        }
    }
</script>
