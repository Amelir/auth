const jwt = require('jsonwebtoken');
const ms = require('ms');
const User = require('./schemas/user');

module.exports = function(req, res, next){
  // Create error to throw in case token is invalid
  const error = new Error();
  error.name = 'InvalidToken';

  // Check if token exists
  let token;
  try{
    token = req.headers.authorization.match(/Bearer (\S+)/)[1];
  }catch(e){
    return next(error);
  }

  // Verify token validity
  jwt.verify(token, process.env.JWT_SECRET, (err, tokenData) => {
    if(err) return next(error);

    // Get users tokens from DB
    User.findOne({email: tokenData.sub}, {tokens: 1})
      .then(model => {
        const date = new Date();

        // Check if token exists in db
        const foundToken = model.tokens.find(token => token.id === tokenData.jti);
        if(!foundToken){
          return next(error);
        }

        // Check if token is expired
        const tokenExpired = date > foundToken.expires;
        if(tokenExpired){
          return next(error);
        }

        // Update datetime of current token
        foundToken.expires = new Date(Date.now() + ms(process.env.JWT_EXPIRES));
        foundToken.lastAccessed = date;
        model.markModified('tokens');

        // Remove expired tokens from db
        model.tokens = model.tokens.filter(token => date < token.expires);

        // Save updated tokens
        model.save(err => {
          if(err) return next(err);

          next();
        });
      })
      .catch(err => next(err));
  });
}