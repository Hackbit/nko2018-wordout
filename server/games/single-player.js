const { dictionary } = require('../services/dictionary');
const { randomLetter } = require('../utils/rand');
const { EventEmitter } = require('events');

const Events = {
    END: 'end',
};

class SinglePlayerGame extends EventEmitter {
    constructor() {
        super();
        this.state = this.getInitialState();
    }

    addWord(word) {
        if (!this.isInGame()) {
            return false;
        }

        const sanitized = dictionary.sanitize(word);
        const isValid = dictionary.isWord(sanitized) && sanitized.startsWith(this.getLetter());
        const isCommon = dictionary.isCommon(sanitized);
        const isDuplicated = this.state.words.has(sanitized);
        let pointCount = 0;

        if (isValid && !isDuplicated) {
            pointCount = sanitized.length + (isCommon ? 0 : 10);
            this.state.words.add(sanitized);
            this.state.points += pointCount;
        }

        return {
            isValid,
            isCommon,
            isDuplicated,
            wordPoints: pointCount,
        };
    }

    addPlayer(ws) {
        this.state.player = ws;
    }


    removePlayer(ws) {
        // No cleanup required...
    }

    start(time = 60) {
        if (this.isInGame()) {
            return false;
        }

        this.reset();
        this.state.letter = randomLetter();
        this.state.isInGame = true;

        if (time !== 0) {
            setTimeout(() => {
                this.state.isInGame = false;
                this.emit(Events.END);
            }, time * 1000);
        }
    }

    getLetter() {
        return this.state.letter;
    }

    getPoints() {
        return this.state.points;
    }

    isInGame() {
        return this.state.isInGame;
    }

    getTotalWordCountForLetter() {
        return dictionary.count(this.getLetter());
    }

    shouldBroadcastStart() {
        return true;
    }


    getTime() {
        return this.state.time;
    }

    reset() {
        this.state = {
            ...this.getInitialState(),
            player: this.state.player,
        };
    }

    onGameEnd(handler) {
        return this.on(Events.END, handler);
    }

    isReady() {
        return !this.isInGame();
    }

    broadcast(ws, payload) {
        if (this.state.player) {
            try {
                console.error('< SENDING: ', JSON.stringify(payload));

                const newData = typeof payload === 'function' ? payload(this.state.player) : payload;
                this.state.player.send(JSON.stringify(newData));
            } catch (e) {
                console.error('< ERROR: ', e);
            }
        }
    }

    getInitialState() {
        return {
            isInGame: false,
            words: new Set(),
            isInProgress: false,
            letter: '',
            points: 0,
            player: null,
            time: 60,
        };
    }
}

module.exports = {
    SinglePlayerGame
};
