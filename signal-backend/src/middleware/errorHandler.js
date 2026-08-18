// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  });
}

function notFound(req, res) {
  res.status(404).json({ error: `No route: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
