module.exports = {
    random: (items) => {
        return items[Math.floor((Math.random()*items.length))];
    },
    randomLetter: () => {
        console.log(module.exports.random(['apple', 'banana']));
        return module.exports.random('abcdefghijklmnopqrstuvwxyz'.split(''));
    }
};
