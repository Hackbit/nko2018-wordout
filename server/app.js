const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressWs = require('express-ws');
const { dictionary } = require('./services/dictionary');

const indexRouter = require('./routes/index');

dictionary.load().then(() => {
    const fileLoc = path.join(__dirname, '../web/dist');
    const app = express();

    expressWs(app);
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(express.static(fileLoc));

    app.use('/', indexRouter(app));

    // catch 404 and forward to error handler

    app.use((req, res) => {
        console.log('Request not recognized, sending index.html');
        res.sendFile(`${fileLoc}/index.html`);
    });

    app.listen(80, () => {
        console.log('App Started');
    });
});