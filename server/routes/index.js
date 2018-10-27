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

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                const send = (payload) => {
                    if (ws && ws.status)
                    ws.send(JSON.stringify(payload));
                }
                const reply = (payload, error = false) => {
                    send({
                        id: data.id,
                        isError: error,
                        payload,
                    });
                };
                const game = new SinglePlayerGame();

                if (data.id && data.endpoint) {
                    switch (data.endpoint) {
                        case 'is-word':
                            return reply({
                                isWord: dictionary.isWord(data.payload),
                            });
                        case 'add':
                            if (!game.isInGame()) {
                                return reply(ERRORS.GAME_NOT_STARTED, true);
                            }

                            return reply({
                                ...game.addWord(data.payload),
                                points: game.getPoints(),
                            });
                        case 'start':
                            if (game.isInGame()) {
                                return reply(ERRORS.GAME_ALREADY_STARTED, true);
                            }

                            game.start(data.payload || 60);

                            game.onGameEnd(() => {
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
