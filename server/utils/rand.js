module.exports = {
    random: (items) => {
        return items[Math.floor((Math.random()*items.length))];
    },
    randomLetter: () => {
        return module.exports.random('abcdefghijklmnopqrstuvwxyz'.split(''));
    }
};
