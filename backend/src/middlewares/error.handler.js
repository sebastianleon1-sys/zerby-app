// Middleware para loguear errores en la consola
export function logErrors(err, req, res, next) {
  console.error('Error capturado:');
  console.error(err.stack); // Imprime el stack trace del error
  next(err); // Pasa al siguiente manejador de errores
}

// Middleware para enviar una respuesta de error genérica al cliente
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    message: err.message || 'Ocurrió un error interno en el servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}