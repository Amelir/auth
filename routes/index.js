const allowMethods = require('allow-methods');
const bcrypt = require('bcrypt');
const express = require('express');
const User = require('../schemas/user');
const errorHandler = require('../utils/errorHandler');

const app = new express.Router();

app
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

          // Password matched. Update login time
          model.lastLogin = Date.now()
          model.save();

          res.end();
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
});

app.use('/register', require('./register'));

// Setup error handler
app.use(errorHandler);

module.exports = app;