const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

/* ---------------------------- Create new review --------------------------- */
exports.createReview = catchAsync(async (request, response, next) => {
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
