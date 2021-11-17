class AppError extends Error {
  /**
   * @abstract AppError builds on top of Error to provide easy error messaging within the
   * context of mongoose and express middleware.
   *
   * @argument message - `String` Your message to the API consumer
   * @argument statusCode - `Number` Error code to display
   * @class AppError
   * @extends {Error}
   */
  constructor(message, statusCode) {
    // calling the parent class which already has a message
    super(message);

    this.statusCode = statusCode;
    // of the status code starts with a 4 its a fail otherwise its error
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // setting this to be just for operational errors
    this.isOperational = true;

    // adding a stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
