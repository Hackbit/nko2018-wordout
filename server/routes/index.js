const express = require('express');
const router = express.Router();

const { dictionary } = require('../services/dictionary');
const { randomLetter } = require('../utils/rand');

const ERRORS = {
    GAME_NOT_STARTED: 'GAME_NOT_STARTED',
    GAME_ALREADY_STARTED: 'GAME_ALREADY_STARTED',
};

module.exports = (app) => {
    app.ws('/ws', (ws) => {
        const state = {
            isInGame: false,
            words: new Set(),
            letter: '',
            points: 0,
        };

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                const reply = (payload, error = false) => {
                    ws.send(JSON.stringify({
                        id: data.id,
                        isError: error,
                        payload,
                    }));
                };

                if (data.id && data.endpoint) {
                    switch (data.endpoint) {
                        case 'is-word':
                            return reply({
                                isWord: dictionary.isWord(data.payload),
                            });
                        case 'add':
                            if (!state.isInGame) {
                                return reply(ERRORS.GAME_NOT_STARTED, true);
                            }

                            const sanitized = dictionary.sanitize(data.payload);
                            const isValid = dictionary.isWord(sanitized) && sanitized.startsWith(state.letter);
                            const isCommon = dictionary.isCommon(sanitized);
                            const isDuplicated = state.words.has(sanitized);

                            if (isValid && !isDuplicated) {
                                state.words.add(sanitized);
                                state.points += isCommon ? 5 : 10;
                            }

                            return reply({
                                isDuplicated,
                                isValid,
                                isCommon,
                                points: state.points,
                                totalWords: state.words.length
                            });
                        case 'start':
                            if (state.isInGame) {
                                return reply(ERRORS.GAME_ALREADY_STARTED, true);
                            }

                            setTimeout(() => {});

                            state.isInGame = true;
                            state.words = new Set();
                            state.points = 0;
                            state.letter = randomLetter();
                            return reply({
                                letter: state.letter,
                                count: dictionary.count(state.letter),
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
