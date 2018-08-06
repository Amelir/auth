const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');

module.exports = function(){
  const app = express();

  // Create write stream for logger
  const stream = fs.createWriteStream(path.join(__dirname, 'access.log'));

  // Setup logging
  const format = ':remote-addr ":date[clf]" ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
  app.use(morgan(format, {stream: stream}));

  // Parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({extended: false}));
  
  // Parse application/json
  app.use(bodyParser.json());

  app.use('/', routes);

  return app;
}