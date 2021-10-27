const express = require('express');
const morgan = require('morgan');

// Importing routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// Initializing application
const app = express();

// MIDDLEWARES -- DECLARE ALL YOUR MIDDLEWARE HERE FOR GLOBAL MIDDLEWARE
app.use(express.json());
app.use(morgan('dev'));
app.use((req, res, next) => {
  console.log('Hello from our custom middleware 💩');
  next();
});
app.use((req, res, next) => {
  // appending the time of the request to the request
  // @ts-ignore
  req.currentTime = new Date().toISOString();
  next();
});

// Mounting routers -- YES THIS IS ALSO MIDDLEWARE
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// SERVER
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
