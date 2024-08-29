const express = require('express');
const serverless = require('serverless-http');
const path = require('path');

const app = express();

app.use(express.json());

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '../../public')));

app.get('/', (req, res) => {
    res.render('index');
});

module.exports.handler = serverless(app);
