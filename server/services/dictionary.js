const fs = require('fs');
const path = require('path');
const { random } = require('../utils/rand');
const mostCommon = require('../most-common/common.json');

class Dictionary {
    constructor() {
        this.loaded = false;
        this.words = new Map();
        this.wordList = [];
        this.letterCount = {};
    }

    async load() {
        if (this.isReady()) {
            return;
        }

        const dictionaries = await this.getDictionaries();

        for (const dictionary of dictionaries) {
            console.log('Loading', this.getDictionaryLocation(dictionary));
            const data = require(this.getDictionaryLocation(dictionary));
            const words = Object.keys(data);

            this.letterCount[this.sanitize(words[0]).substr(0, 1)] = words.length;
            for (const word of words) {
                const definition = data[word];
                this.words.set(this.sanitize(word), definition);
                this.wordList.push(this.sanitize(word));
            }
        }
        this.loaded = true;
    }

    getRandomWord() {
        if (!this.isReady()) {
            return false;
        }

        return random(this.wordList);
    }

    getDictionaryLocation(file) {
        return path.join(__dirname, '..', 'dictionary', file || '');
    }

    getDictionaries() {
        return new Promise((resolve, reject) => {
            const location = this.getDictionaryLocation();
            const dictionaries = [];

            fs.readdir(location, (err, files) => {
                if (err) {
                    throw err;
                }

                let i = 0;
                for (const file of files) {
                    const fileLoc = this.getDictionaryLocation(file);
                    fs.stat(fileLoc, (err, stats) => {
                        i++;

                        if (err) {
                            console.log(err);
                            throw err;
                        }

                        if (!stats.isDirectory()) {
                            dictionaries.push(file);
                        }

                        if (i === files.length) {
                            resolve(dictionaries);
                        }
                    });
                }
            });
        });
    }

    isReady() {
        return this.loaded;
    }

    isWord(word) {
        if (!this.isReady()) {
            return false;
        }

        return this.words.has(this.sanitize(word));
    }

    sanitize(word) {
        return (word || '').toLocaleLowerCase().trim();
    }

    isCommon(word) {
        if (!this.isReady()) {
            return false;
        }

        return mostCommon.indexOf(this.sanitize(word)) !== -1;
    }

    count(letter) {
        return this.letterCount[this.sanitize(letter)];
    }

    getDefinition(word) {
        if (!this.isReady()) {
            return false;
        }

        return this.words.get(word);
    }
}

module.exports = {
    dictionary: new Dictionary()
};