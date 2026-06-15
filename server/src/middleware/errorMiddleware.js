// server/middleware/errorMiddleware.js – Central error handler

function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[ERROR] ${err.message}`);
  res.status(statusCode).json({
    error  : err.message || 'Internal Server Error',
    stack  : process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

module.exports = { errorHandler };