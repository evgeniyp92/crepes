const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1. Get all tour data from collection
  const allTours = await Tour.find();
  // 2. Build the template
  // 3. Render the template using the tour data from step 1

  res.status(200).render('overview', {
    title: 'All Tours',
    allTours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  console.log(tour);

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});
