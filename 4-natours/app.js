const express = require('express');
const morgan = require('morgan');

// Importing routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// Initializing application
const app = express();

// MIDDLEWARES -- DECLARE ALL YOUR MIDDLEWARE HERE FOR GLOBAL MIDDLEWARE
// logging via morgan
app.use(morgan('dev'));
// bodyparser
app.use(express.json());
// serving static pages
app.use(express.static(`${__dirname}/public`));
// hello world
app.use((req, res, next) => {
  console.log('Hello from our custom middleware 💩');
  next();
});
// append time to the request object
app.use((req, res, next) => {
  // @ts-ignore
  req.currentTime = new Date().toISOString();
  next();
});

// Mounting routers -- YES THIS IS ALSO MIDDLEWARE
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// SERVER
module.exports = app;
