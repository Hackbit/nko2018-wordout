const { dictionary } = require('../services/dictionary');
const { randomLetter } = require('../utils/rand');

class SinglePlayerGame {
    constructor() {
        this.state = this.getInitialState();
    }

    addWord(word) {
        const sanitized = dictionary.sanitize(word);
        const isValid = dictionary.isWord(sanitized) && sanitized.startsWith(this.state.letter);
        const isCommon = dictionary.isCommon(sanitized);
        const isDuplicated = this.state.words.has(sanitized);

        if (isValid && !isDuplicated) {
            this.state.words.add(sanitized);
            this.state.points += isCommon ? 5 : 10;
        }
    }

    start() {
        this.state = this.getInitialState();
        state.letter = randomLetter();
        state.isInGame = true;
    }

    count() {
        return this.state.words.length;
    }

    reset() {
        this.state = this.getInitialState();
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