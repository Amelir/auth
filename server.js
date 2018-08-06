const bodyParser = require('body-parser');
const express = require('express');
const routes = require('./routes');

module.exports = function(){
  const app = express();

  // Parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({extended: false}));
  
  // Parse application/json
  app.use(bodyParser.json());

  app.use('/', routes);

  return app;
}