/* eslint-disable no-param-reassign */
module.exports = (error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'Unknown error';

  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};
