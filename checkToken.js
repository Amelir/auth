const jwt = require('jsonwebtoken');
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
  jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
    if(err) return next(error);

    // Get users tokens from DB
    User.findOne({email: data.sub}, {tokens: 1})
      .then(model => {
        let tokenValid = false;
        const date = new Date();

        // No users were found
        if(!model){
          return next(error);
        }

        model.tokens.forEach((token, index) => {
          // Remove token if it's expired
          if(date > token.expires){
            model.tokens.splice(index, 1);
          }

          // Check if token ID is in database, and is still valid
          if(token.id === data.jti && token.expires > date){
            tokenValid = true;
          }
        });

        // Save updated tokens to database
        model.save();

        if(tokenValid){
          // Save user data to request
          req.user = data.sub;
          
          next();
        }else{
          next(error);
        }
      });
  });
}