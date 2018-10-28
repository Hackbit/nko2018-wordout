const express = require('express');
const router = express.Router();

const { dictionary } = require('../services/dictionary');
const { SinglePlayerGame } = require('../games/single-player');
const { TwoPlayerGame, Games } = require('../games/two-player');


const ERRORS = {
    GAME_NOT_STARTED: 'GAME_NOT_STARTED',
    GAME_ALREADY_STARTED: 'GAME_ALREADY_STARTED',
    INVALID_KEY: 'INVALID_JOIN_KEY',
};

module.exports = (app, expWs) => {

    const wss = expWs.getWss();

    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
          if (ws.isAlive === false) return ws.terminate();

          ws.isAlive = false;
          console.log('<> PING');
          ws.ping();
        });
    }, 10000);

    app.ws('/ws', (ws) => {

        ws.isAlive = true;
        ws.on('pong', () => {
            ws.isAlive = true;
            console.log('<> PONG');
        });

        let currentGame = null;
        console.log('Upgraded Connection');
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                console.log('> RECEIVED: ', message);
                const send = (payload) => {
                    if (!ws.isAlive) {
                        return;
                    }

                    try {
                        const jsonData = JSON.stringify(payload);
                        console.log('< SENDING: ', jsonData);
                        ws.send(jsonData);
                    } catch (e) {
                        console.error('< ERROR: ', e);
                    }
                };

                const reply = (payload, error = false) => {
                    send({
                        id: data.id,
                        isError: error,
                        payload,
                    });
                };

                if (data.id && data.endpoint) {
                    switch (data.endpoint) {
                        case 'is-word':
                            console.log(`- Checking if "${data.payload}" is a word.`);
                            return reply({
                                isWord: dictionary.isWord(data.payload),
                            });
                        case 'add':
                            if (!currentGame || !currentGame.isInGame()) {
                                console.log('- Cannot add word, no longer in a game.');
                                return reply(ERRORS.GAME_NOT_STARTED, true);
                            }

                            const word = {
                                ...currentGame.addWord(data.payload, ws),
                                word: dictionary.sanitize(data.payload),
                                points: currentGame.getPoints()
                            };

                            console.log('Broadcasting word...');
                            currentGame.broadcast(ws, {
                                type: 'add-word',
                                payload: word,
                            });

                            console.log(`- Adding word "${data.payload}".`);
                            return reply(word);
                        case 'start':
                            currentGame = null;
                            if (!currentGame && data.payload.type) {
                                switch (data.payload.type) {
                                    case "SINGLE_PLAYER":
                                        currentGame = new SinglePlayerGame();
                                        break;
                                    case "TWO_PLAYER":
                                        if (data.payload.key && typeof data.payload.key === "string") {
                                            const key = data.payload.key.toUpperCase();
                                            if (!Games.has(key)) {
                                                return reply(ERRORS.INVALID_KEY, true);
                                            }

                                            currentGame = Games.get(key);
                                        } else {
                                            console.log('Created Game');
                                            currentGame = new TwoPlayerGame();
                                        }
                                        break;
                                }
                            }
                            if (!currentGame || currentGame.isInGame()) {
                                console.log('- Cannot start game, already in game.');
                                return reply(ERRORS.GAME_ALREADY_STARTED, true);
                            }

                            currentGame.addPlayer(ws, data.payload.key);

                            const isReady = currentGame.isReady();

                            if (isReady) {
                                currentGame.start(data.payload.time || 60);

                                currentGame.onGameEnd(() => {
                                    console.log('- Game has ended.');
                                    currentGame.broadcast(ws, {
                                        type: 'game-end',
                                        payload: null
                                    });
                                });


                                currentGame.broadcast(ws, {
                                    type: 'game-start',
                                    payload: {
                                        letter: currentGame.getLetter(),
                                        count: currentGame.getTotalWordCountForLetter(),
                                    }
                                });

                                return reply({
                                    letter: currentGame.getLetter(),
                                    count: currentGame.getTotalWordCountForLetter(),
                                });
                            }

                            console.log('Sending Game Key');

                            return reply({
                                success: true,
                                key: currentGame.getJoinKey(),
                            });
                    }
                }
            } catch (e) {
                console.error(e);
            }
        });
    });
    return router;
};
