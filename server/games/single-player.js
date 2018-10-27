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

        if (isValid && !isDuplicated) {
            this.state.words.add(sanitized);
            this.state.points += isCommon ? 5 : 10;
        }

        return {
            isValid,
            isCommon,
            isDuplicated,
        };
    }

    start(time = 60) {
        if (this.isInGame()) {
            return false;
        }

        this.state = this.getInitialState();
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
        return this.state.points();
    }

    isInGame() {
        return this.state.isInGame;
    }

    getWordCount() {
        return this.state.words.length;
    }

    getTotalWordCountForLetter() {
        return dictionary.count(this.getLetter());
    }

    reset() {
        this.state = this.getInitialState();
    }

    onGameEnd(handler) {
        return this.on(Events.END, handler);
    }

    getInitialState() {
        return {
            isInGame: false,
            words: new Set(),
            isInProgress: false,
            letter: '',
            points: 0,
        };
    }
}

module.exports = {
    SinglePlayerGame
};
