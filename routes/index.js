const express = require('express');

const app = new express.Router();

app.get('/', (req, res) => {
  res.send('This is a server');
});

module.exports = app;