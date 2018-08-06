const bcrypt = require('bcrypt');
const route = require('express').Router();
const User = require('../schemas/user');

route.post('/', (req, res, next) => {
  // Check if required data is present
  const requiredFields = ['firstName', 'lastName', 'email', 'password'];
  const missingFields = [];

  requiredFields.forEach(field => {
    if(!req.body[field]){
      missingFields.push(field);
    }
  });

  // Fail if required fields are missing
  if(missingFields.length){
    res.status(422).send({message: 'Missing required fields.'});
    return;
  }

  // Check if email matches pattern
  if(!/^\S+@\S+\.\S{2,}$/.test(req.body.email)){
    res.status(400).send({message: 'Email is invalid.'});
    return;
  }

  // Check if email already exists
  User.countDocuments({email: req.body.email})
    .then(count => {
      
      // Email is already registered
      if(count){
        res.status(409).send({message: 'Email is already registered.'});
        return;
      }

      // Hash password
      bcrypt.hash(req.body.password, 10)
        .then(hash => {

          // Save user in database
          const createdUser = new User({
            email: req.body.email,
            hash: hash,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            verified: false
          });

          createdUser.save(err => {
            if(err) return next(err);

            res.end();
          });
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
});

module.exports = route;