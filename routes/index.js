const express = require('express');

const app = new express.Router();

app.get('/', (req, res) => {
  res.send('This is a server');
});

app.use('/register', require('./register'));

module.exports = app;