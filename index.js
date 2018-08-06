const boot = require('./boot');
const chokidar = require('chokidar');
const debug = require('debug')('app');
const mongoose = require('mongoose');
const path = require('path');

// Load environmental variables
require('dotenv').config();

const state = {
  server: null,
  sockets: []
}

boot()
  .then(() => {
    start();
    chokidar.watch(['./routes', './schemas']).on('all', (event, at) => {
      if(event === 'change'){
        debug('Changes at', at);
        restart();
      }
    });
  })
  .catch(debug);

function start(){
  // Start API server
  state.server = require('./server')()
    .listen(process.env.PORT, () => debug('API started on port', process.env.PORT));

  state.server.on('connection', socket => {
    state.sockets.push(socket)
  });
}

function restart(){
  // Clear require cache
  Object.keys(require.cache).forEach(id => {
    if(checkPath(id)){
      debug('Reloading', id);
      delete require.cache[id];
    }
  });

  state.sockets.forEach(socket => {
    if(socket.destroyed === false){
      socket.destroy();
    }
  });

  mongoose.models = {}
  mongoose.modelSchemas = {}
  mongoose.connection.models = {}

  state.sockets = [];

  state.server.close(() => {
    debug('Server is closed');
    debug('\n---restarting---');
    start();
  });
}

function checkPath(id){
  return (
    id.startsWith(path.join(__dirname, 'routes')) ||
    id.startsWith(path.join(__dirname, 'server.js'))
  );
}