const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1. Get all tour data from collection
  const allTours = await Tour.find();
  // 2. Build the template
  // 3. Render the template using the tour data from step 1

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      'connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com ws://localhost:* http://localhost:4000/'
    )
    .render('overview', {
      title: 'All Tours',
      allTours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  console.log(tour);

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      'connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com http://localhost:4000/ ws://localhost:*'
    )
    .render('tour', {
      title: tour.name,
      tour,
    });
});

exports.getLoginForm = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      'connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com https://cdnjs.cloudflare.com http://localhost:4000 ws://localhost:*'
    )
    .render('login', {
      title: 'Login',
    });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', { title: 'Your account' });
};
