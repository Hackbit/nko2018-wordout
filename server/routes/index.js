const express = require('express');
const router = express.Router();

const { dictionary } = require('../services/dictionary');
const { SinglePlayerGame } = require('../games/single-player');

const ERRORS = {
    GAME_NOT_STARTED: 'GAME_NOT_STARTED',
    GAME_ALREADY_STARTED: 'GAME_ALREADY_STARTED',
};

module.exports = (app) => {
    app.ws('/ws', (ws) => {
        const game = new SinglePlayerGame();
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                console.log('> RECEIVED: ', message);
                const send = (payload) => {
                    const jsonData = JSON.stringify(payload);
                    console.log('< SENDING: ', jsonData);
                    ws.send(jsonData);
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
                            if (!game.isInGame()) {
                                console.log('- Cannot add word, no longer in a game.');
                                return reply(ERRORS.GAME_NOT_STARTED, true);
                            }

                            console.log(`- Adding word "${data.payload}".`);
                            return reply({
                                ...game.addWord(data.payload),
                                points: game.getPoints()
                            });
                        case 'start':
                            if (game.isInGame()) {
                                console.log('- Cannot start game, already in game.');
                                return reply(ERRORS.GAME_ALREADY_STARTED, true);
                            }

                            console.log('- Game Starting.');
                            game.start(data.payload || 60);

                            game.onGameEnd(() => {
                                console.log('- Game has ended.');
                                send({
                                    type: 'game-end',
                                    payload: {
                                        totalPoints: game.getPoints(),
                                    },
                                })
                            });

                            return reply({
                                letter: game.getLetter(),
                                count: game.getTotalWordCountForLetter(),
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
