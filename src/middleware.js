const logRoute = (req, res, next) => {
    console.log(`Ruta consultada: ${req.originalUrl}`);
    next();
  };
  
  module.exports = { logRoute };
  