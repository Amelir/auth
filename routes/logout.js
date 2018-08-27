const allowMethods = require('allow-methods');
const checkToken = require('../checkToken');
const route = require('express').Router();
const { User } = require('schemas').models;

route
  .use(checkToken)
  .route('/')
  .all(allowMethods(['post']))
  .post((req, res, next) => {
    // Remove token from database
    User.findOneAndUpdate({email: req.user.sub}, {$pull: {tokens: {id: req.user.jti}}})
      .then(() => res.end())
      .catch(next);
  });

module.exports = route;