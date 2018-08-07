module.exports = function(err, req, res, next){
  switch(err.name){
    case 'MethodNotAllowedError': {
      res.status(405).send({message: `${req.method} method not allowed.`});
      break;
    }

    default: {
      res.status(500).send({message: 'Something went wrong.'});
      break;
    }
  }
}