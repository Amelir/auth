const debug = require('debug')('app');
const mongoose = require('mongoose');

module.exports = function(){
  return new Promise(resolve => {
    debug('Connecting to database...');
    
    const dbUrl = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    mongoose.connect(dbUrl, {useNewUrlParser: true});
    mongoose.Promise = Promise;

    mongoose.connection.on('connected', () => {
      debug('Database connected');
      resolve();
    });

    mongoose.connection.on('error', err => {
      debug('Mongoose error occured', err);
    });

    mongoose.connection.on('disconnected', () => {
      debug('Database disconnected');
    });

    // Setup process end tasks
    process.on('SIGINT', () => {
      mongoose.connection.close(() => {
        process.exit(0);
      });
    });
  });
}