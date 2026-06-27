module.exports = (err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  if (res.headersSent) {
    return next(err);
  }
  
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    mensaje: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};