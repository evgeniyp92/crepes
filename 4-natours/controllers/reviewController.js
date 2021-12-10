const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setTourUserIds = (request, response, next) => {
  // Allow nested routes by defining these args when they're not there
  if (!request.body.tour) request.body.tour = request.params.tourId;
  if (!request.body.user) request.body.user = request.user.id; // the user object comes from protect
  next();
};

exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);

/* ----------------------------- Get all reviews ---------------------------- */
exports.getAllReviews = catchAsync(async (request, response, next) => {
  // if a tourId param exists, set the filter to respond with just the reviews
  // of that tour
  let filter = {};
  if (request.params.tourId) filter = { tour: request.params.tourId };

  const allReviews = await Review.find(filter);

  response.json({
    status: 'success',
    reviews: allReviews,
  });
});
