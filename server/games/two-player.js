const { dictionary } = require('../services/dictionary');
const { randomLetter } = require('../utils/rand');
const { EventEmitter } = require('events');

const Events = {
    END: 'end',
    ERROR: 'game-error',
};

class Player {
    constructor(ws, isHost) {
        this.ws = ws;
        this.points = 0;
        this.isHost = isHost;
        this.name = "Player";
    }

    send(payload) {
        const data = JSON.stringify(payload)
        console.log('> SEND: ', data);
        this.ws.send(data);
    }
}

const Games = new Map();

class TwoPlayerGame extends EventEmitter {
    constructor() {
        super();
        this.state = this.getInitialState();
    }

    addWord(word, ws) {
        const player = this.getPlayerFromWs(ws);

        if (!this.isInGame() && player) {
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
            player.points += pointCount;
        }

        return {
            isValid,
            isCommon,
            isDuplicated,
            wordPoints: pointCount,
        };
    }

    start(time = 60) {
        if (this.isInGame()) {
            return false;
        }

        this.reset();
        this.state.letter = randomLetter();
        this.state.isInGame = true;

        if (time !== 0 && time > 0) {
            setTimeout(() => {
                this.state.isInGame = false;
                this.emit(Events.END);
            }, time * 1000);
        }
    }

    getPlayerFromWs(ws) {
        return this.getPlayers().find(({ ws: socket }) => ws === socket);
    }

    hasJoined(ws) {
        return !this.getPlayerFromWs(ws);
    }

    isHost(ws) {
        return this.getPlayerFromWs(ws);
    }

    addPlayer(ws, joinKey) {
        const players = this.getPlayers().length;

        if (!this.isInGame() && players >= 2) {
            throw 'ERORR_IN_PLAY';
        }

        if (players === 0 && joinKey === null) {
            this.setJoinKey();
        }

        const player = new Player(ws, this.state.players.length === 0);
        this.state.players.push(player);

        return player;
    }

    getLetter() {
        return this.state.letter;
    }

    getPoints() {
        return this.state.players.map((player) => {
            return ({
                isHost: player.isHost,
                points: player.points,
            });
        });
    }

    getPlayers() {
        return this.state.players;
    }

    getJoinKey() {
        return this.state.joinKey;
    }

    isInGame() {
        return this.state.isInGame;
    }

    getTotalWordCountForLetter() {
        return dictionary.count(this.getLetter());
    }

    reset() {
        this.state = {
            ...this.getInitialState(),
            joinKey: this.state.joinKey,
            players: this.state.players,
        };

        this.getPlayers().forEach((player) => {
            player.points = 0;
        });
    }

    setJoinKey() {
        let key = dictionary.getRandomWord();
        while (key.length > 10) {
            key = dictionary.getRandomWord();
        }

        this.state.joinKey = key;
        Games.set(key.toUpperCase(), this);
    }

    onGameEnd(handler) {
        return this.on(Events.END, handler);
    }

    broadcast(ws, data) {
        console.log('Broadcasting data to', this.getPlayers().length, 'players');
        this.getPlayers().forEach((player) => {
            try {
                if (data && data.payload) {
                    data.payload.isMe = player.ws === ws;
                }

                player.send(data);
            } catch (e) {
                console.error('< ERROR: ', e);
                this.state.isInGame = false;
                this.emit(Events.ERROR);
            }
        });
    }

    isReady() {
        return this.getPlayers().length === 2 && !this.isInGame();
    }

    getInitialState() {
        return {
            isInGame: false,
            joinKey: null,
            words: new Set(),
            isInProgress: false,
            letter: '',
            players: [
            ]
        };
    }
}

module.exports = {
    TwoPlayerGame,
    Games
};
