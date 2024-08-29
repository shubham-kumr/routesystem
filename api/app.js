const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();

// Set up server
const server = http.createServer(app);
const io = socketio(server);

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Route to render index.ejs
app.get('/', (req, res) => {
    console.log('Rendering index.ejs');
    res.render('index');
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.on('send-location', (coords) => {
        io.emit('receive-location', { id: socket.id, ...coords });
    });

    socket.on('disconnect', () => {
        io.emit('user-disconnect', socket.id);
    });
});

module.exports = (req, res) => {
    app(req, res);
};
