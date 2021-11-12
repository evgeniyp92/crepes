const express = require('express');
const morgan = require('morgan');

// Importing routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// Initializing application
const app = express();

// MIDDLEWARES -- DECLARE ALL YOUR MIDDLEWARE HERE FOR GLOBAL MIDDLEWARE
// logging via morgan
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
// bodyparser
app.use(express.json());
// serving static pages
app.use(express.static(`${__dirname}/public`));
// append time to the request object
app.use((req, res, next) => {
  // @ts-ignore
  req.currentTime = new Date().toISOString();
  next();
});

// Mounting routers -- YES THIS IS ALSO MIDDLEWARE
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Controlling for a route that isnt handled by any router listed above
app.all('*', (request, response, next) => {
  response.status(404).json({
    status: 'fail',
    message: `Route ${request.originalUrl} does not exist`,
  });
});

// SERVER
module.exports = app;
