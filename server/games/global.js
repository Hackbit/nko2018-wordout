const { dictionary } = require('../services/dictionary');
const { randomLetter } = require('../utils/rand');
const { EventEmitter } = require('events');

const Events = {
    END: 'end',
    ERROR: 'game-error',
};

class Player {
    constructor(ws) {
        this.ws = ws;
        this.points = 0;
        this.name = "Player";
    }

    send(payload) {
        const data = JSON.stringify(payload)
        console.log('> SEND: ', data);
        this.ws.send(data);
    }
}

const Games = new Map();

class GlobalChallenge extends EventEmitter {
    constructor() {
        super();
        this.state = this.getInitialState();
        this.state.points = this.getTotalWordCountForLetter();
    }

    addWord(word, ws) {
        const player = this.getPlayerFromWs(ws);

        if (!player) {
            console.log('Cant find that user. They must bere here though for that reference...');
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
            this.state.points--;
        }

        return {
            isValid,
            isCommon,
            isDuplicated,
            wordPoints: pointCount,
        };
    }

    start(ws) {
        ws.on('close', () => {
            console.log('REMOVING PLAYER');
            this.removePlayer(ws);
        });
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

    removePlayer(ws) {
        const playerIndex = this.state.players.indexOf(this.getPlayerFromWs(ws));

        if (playerIndex !== -1) {
            this.state.players.splice(playerIndex, 1);
        }
    }

    addPlayer(ws) {
        console.log('Adding player to global game', !!ws);
        const player = new Player(ws);
        this.state.players.push(player);

        return player;
    }

    getLetter() {
        return this.state.letter;
    }

    getPlayers() {
        return this.state.players;
    }

    getTime() {

        const DAY = 60 * 60 * 24 * 1000;
        return Math.round((DAY - (Date.now() % DAY)) / 1000);
    }

    isInGame() {
        return false;
    }

    getPoints() {
        return this.state.points;
    }

    getTotalWordCountForLetter() {
        return dictionary.count(this.getLetter());
    }

    reset() {
        this.state = {
            ...this.getInitialState(),
            players: this.state.players,
        };

        this.state.points = this.getTotalWordCountForLetter();
        this.getPlayers().forEach((player) => {
            player.points = 0;
        });
    }

    onGameEnd(handler) {
        return this.on(Events.END, handler);
    }

    shouldBroadcastStart() {
        return false;
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
        return true;
    }

    getInitialState() {
        return {
            words: new Set(),
            letter: randomLetter(),
            points: 0,
            players: [
            ],
        };
    }
}

module.exports = {
    GlobalChallenge,
    Games
};
