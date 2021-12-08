const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

/* ---------------------------- Create new review --------------------------- */
exports.createReview = catchAsync(async (request, response, next) => {
  // Allow nested routes by defining these args when they're not there
  if (!request.body.tour) request.body.tour = request.params.tourId;
  if (!request.body.user) request.body.user = request.user.id; // the user object comes from protect
  const newReview = await Review.create(request.body);

  response.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

/* ----------------------------- Get all reviews ---------------------------- */
exports.getAllReviews = catchAsync(async (request, response, next) => {
  const allReviews = await Review.find();

  response.json({
    status: 'success',
    reviews: allReviews,
  });
});
