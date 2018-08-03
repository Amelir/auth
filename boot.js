const debug = require('debug')('app');

module.exports = function(){
  return new Promise(resolve => {
    debug('Connecting to database...');
    setTimeout(() => {
      debug('Database connected');
      resolve();
    }, 1000);
  });
}