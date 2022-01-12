const AppError = require('../utils/appError');

/* eslint-disable no-param-reassign */
// Error generators
const handleCastErrorDB = error => {
  const message = `Invalid: ${error.path} is ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = error => {
  const duplicateFields = Object.keys(error.keyPattern).join(', ');
  const message = `Duplicate field values for the following: ${duplicateFields}. please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = error => {
  const invalidFields = Object.values(error.errors).map(
    element => element.message
  );
  const message = `Invalid input data. ${invalidFields.join('. ')}.`;
  return new AppError(message, 400);
};

const handleJWTError = error =>
  new AppError('Invalid token. Please log in again', 401);

const handleExpiredTokenError = error =>
  new AppError('Invalid token. Please log in again', 401);

// Error handlers
const sendErrorForDev = (error, response) => {
  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    error: { ...error, name: error.name },
  });
};

const sendErrorForProd = (error, response) => {
  if (error.isOperational) {
    response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    // eslint-disable-next-line no-console
    console.log(`🤖 ERROR 🤖: ${error}`);
    response.status(500).json({
      status: 'error',
      message: `Unhandled error!`,
    });
  }
};

// Core function
module.exports = (error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status =
    error.status ||
    'Unhandled error 😬, you should not be able to see this if you are in prod';

  if (process.env.NODE_ENV === 'development') {
    // sending error in development
    sendErrorForDev(error, response);
  } else if (process.env.NODE_ENV === 'production') {
    // sending errors in production

    // for some goddamn reason you have to spread error, and then create a name
    // property with a value of error.name, otherwise the property isnt readable
    let err = { ...error, name: error.name };
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError(err);
    if (err.name === 'TokenExpiredError') err = handleExpiredTokenError(err);
    sendErrorForProd(err, response);
  }
};
