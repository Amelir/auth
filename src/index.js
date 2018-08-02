const express = require('express');

const app = express();

app.use('*', (req, res, next) => {
  res.send('app running');
});

app.listen('8081');