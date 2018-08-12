const allowMethods = require('allow-methods');
const bcrypt = require('bcrypt');
const express = require('express');
const ms = require('ms');
const jwt = require('jsonwebtoken');
const User = require('../schemas/user');
const uuid = require('uuid/v1');
const uuid4 = require('uuid/v4');

const route = new express.Router();

route
  .route('/')
  .all(allowMethods(['post']))
  .post((req, res, next) => {
    // Check if required data is present
    const requiredFields = ['email', 'password'];
    const missingFields = [];
  
    requiredFields.forEach(field => {
      if(!req.body[field]){
        missingFields.push(field);
      }
    });
  
    // Fail if required fields are missing
    if(missingFields.length){
      res.status(401).send({message: 'Incorrect username or password.'});
      return;
    }

  // Get user from database
  User.findOne({email: req.body.email})
    .then(model => {
      
      // Fail if no user was found
      if(!model){
        res.status(401).send({message: 'Incorrect username or password.'});
        return;
      }

      // Compare hash
      bcrypt.compare(req.body.password, model.hash)
        .then(match => {
          if(!match){
            res.status(401).send({message: 'Incorrect username or password.'});
            return;
          }

          // Generate token data
          const tokenData = {
            id: (uuid4() + uuid()).replace(/-/g, ''),
            date: new Date(),
            exp: new Date(Date.now() + ms('1h'))
          }

          // Save token in database
          model.tokens.push({
            id: tokenData.id,
            issued: tokenData.date,
            expires: tokenData.exp,
            lastAccessed: tokenData.date
          });

          model.save()
            .then(() => {
              
              // Create token
              const token = jwt.sign({}, process.env.JWT_SECRET, {
                issuer: 'AMELIR_AUTH',
                audience: 'AMELIR',
                subject: model.email,
                jwtid: tokenData.id
              });

              res.send({
                access_token: token,
                token_type: 'bearer'
              });
            })
            .catch(err => next(err));
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
});

route.use('/register', require('./register'));

module.exports = route;