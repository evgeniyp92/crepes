const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.setTourUserIds = (request, response, next) => {
  // Allow nested routes by defining these args when they're not there
  if (!request.body.tour) request.body.tour = request.params.tourId;
  if (!request.body.user) request.body.user = request.user.id; // the user object comes from protect
  next();
};

exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.getAllReviews = factory.getAll(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
