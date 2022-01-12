/* eslint-disable func-names */
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// reviewSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'tour',
//     select: 'name',
//   });
//   next();
// });

// reviewSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'user',
//   });
//   next();
// });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // in this context the this keyword is the query not the document
  // so we just run findOne
  this.r = await this.findOne();
  console.log(this.r);
  next();
  // We need to ensure we are using relevant data to calculate ratings
  // You cant change this to a post function because we lose access to the query
});

reviewSchema.post(/^findOneAnd/, async function () {
  // In order to maintain state we assign the result of the query to this
  // also in this case the method is nested even deeper
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

reviewSchema.post('save', function () {
  // You cannot call the static method by using Review.blahblah
  // So use this.constructor

  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.statics.calcAverageRatings = async function (tourID) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourID },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  await Tour.findByIdAndUpdate(tourID, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
