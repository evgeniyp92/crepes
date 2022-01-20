const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
// eslint-disable-next-line node/no-extraneous-require
const hpp = require('hpp');

const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');

/* ---------------------------- Importing routers --------------------------- */
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

/* ------------------------ Initializing application ------------------------ */
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

/* -------------------------- serving static pages -------------------------- */
app.use(express.static(`${__dirname}/public`));

/* -- MIDDLEWARES -- DECLARE ALL YOUR MIDDLEWARE HERE FOR GLOBAL MIDDLEWARE - */
// helmet
app.use(helmet());

// logging via morgan
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// rate limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Stop hammering the api, fucker. Go away.',
});
app.use('/api', limiter);

// bodyparser
app.use(express.json({ limit: '10kb' }));

// data sanitizing against NoSQL injection and xss
app.use(mongoSanitize());
app.use(xss());

// preventing param pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// append time to the request object
app.use((req, res, next) => {
  // @ts-ignore
  req.currentTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// Mounting routers -- YES THIS IS ALSO MIDDLEWARE

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

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
