const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');

// Importing routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// Initializing application
const app = express();

// MIDDLEWARES -- DECLARE ALL YOUR MIDDLEWARE HERE FOR GLOBAL MIDDLEWARE
// logging via morgan
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
// rate limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Stop hammering the api, fucker. Go away',
});
app.use('/api', limiter);
// bodyparser
app.use(express.json());
// serving static pages
app.use(express.static(`${__dirname}/public`));
// append time to the request object
app.use((req, res, next) => {
  // @ts-ignore
  req.currentTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// Mounting routers -- YES THIS IS ALSO MIDDLEWARE
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Controlling for a route that isnt handled by any router listed above
app.all('*', (request, response, next) => {
  // const error = new Error(
  //   `Requested route ${request.originalUrl} does not exist`
  // );
  // error.status = 'fail';
  // error.statusCode = 404;

  // passing an error to next() will cause it to go to our error handler
  next(
    new AppError(`Requested route ${request.originalUrl} does not exist`, 404)
  );
});

app.use(errorController);

// SERVER
module.exports = app;
