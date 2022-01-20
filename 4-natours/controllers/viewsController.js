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

exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour',
  });
};
