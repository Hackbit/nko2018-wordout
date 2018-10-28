const express = require('express');
const router = express.Router();

const { dictionary } = require('../services/dictionary');
const { SinglePlayerGame } = require('../games/single-player');
const { GlobalChallenge } = require('../games/global');
const { TwoPlayerGame, Games } = require('../games/two-player');


const ERRORS = {
    GAME_NOT_STARTED: 'GAME_NOT_STARTED',
    GAME_ALREADY_STARTED: 'GAME_ALREADY_STARTED',
    INVALID_KEY: 'INVALID_JOIN_KEY',
};

const DAY = 60 * 60 * 24 * 1000;

module.exports = (app, expWs) => {

    const wss = expWs.getWss();

    setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
          if (ws.isAlive === false) return ws.terminate();

          ws.isAlive = false;
          console.log('<> PING');
          ws.ping();
        });
    }, 10000);

    let globalChallenge = new GlobalChallenge();
    setTimeout(function resetGlobal () {
        globalChallenge.reset();
        globalChallenge.broadcast({
            type: 'game-start',
            payload: {
                letter: globalChallenge.getLetter(),
                count: globalChallenge.getTotalWordCountForLetter(),
                endsIn: globalChallenge.getTime(),
            }
        });
        setTimeout(resetGlobal, DAY);
    }, globalChallenge.getTime());

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
                        case 'leave':
                            if (currentGame) {
                                currentGame.removePlayer(ws);
                            }
                            return reply(true);
                        case 'add':
                            if ((!currentGame || !currentGame.isInGame()) && currentGame !== globalChallenge) {
                                console.log('- Cannot add word, no longer in a game.', currentGame.isInGame());
                                return reply(ERRORS.GAME_NOT_STARTED, true);
                            }

                            const word = {
                                ...currentGame.addWord(data.payload, ws),
                                word: dictionary.sanitize(data.payload),
                            };

                            console.log('Broadcasting word...');
                            currentGame.broadcast(ws, (socket) => ({
                                type: 'add-word',
                                payload: {
                                    ...word,
                                    points: currentGame.getPoints(socket),
                                },
                            }));

                            console.log(`- Adding word "${data.payload}".`);
                            return reply(word);
                        case 'start':
                            if (currentGame) {
                                currentGame.removePlayer(ws);
                                currentGame = null;
                            }
                            let isGlobal = false;
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
                                    case "GLOBAL":
                                        currentGame = globalChallenge;
                                        isGlobal = true;
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
                                const time = data.payload.time || currentGame.getTime();
                                currentGame.start(isGlobal ? ws : time);

                                currentGame.onGameEnd(() => {
                                    console.log('- Game has ended.');
                                    currentGame.broadcast(ws, {
                                        type: 'game-end',
                                        payload: null
                                    });
                                });

                                if (currentGame.shouldBroadcastStart()) {
                                    currentGame.broadcast(ws, (socket) => ({
                                        type: 'game-start',
                                        payload: {
                                            letter: currentGame.getLetter(),
                                            points: currentGame.getPoints(socket),
                                            count: currentGame.getTotalWordCountForLetter(),
                                            endsIn: time
                                        }
                                    }));
                                }

                                return reply({
                                    letter: currentGame.getLetter(),
                                    points: currentGame.getPoints(ws),
                                    count: currentGame.getTotalWordCountForLetter(),
                                    endsIn: time,
                                });
                            }

                            console.log('Sending Game Key', currentGame.state);

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
