/* eslint-disable func-names, prefer-arrow-callback */
const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'No name specified'],
      unique: true,
      trim: true,
      maxlength: [40, 'Tour name is too long'],
      minlength: [10, 'Tour name is too short'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can only be easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating cannot be lower than 1.0'],
      max: [5, 'Rating cannot be greater than 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'No price specified'],
    },
    priceDiscount: {
      type: Number,
      // note that this validate will only run on new documents, not updates
      validate: {
        validator(specifiedValue) {
          return specifiedValue < this.price;
        },
        message:
          'Discount price ({VALUE}) should not be greater number than regular price',
      },
    },
    summary: {
      type: String,
      // cuts leading and trailing whitespace
      trim: true,
      required: [true, 'Summary is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    // specifying an array of strings to be the data type
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      desscription: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review', // identifying the model to reference
  foreignField: 'tour', // the foreign reference where to go looking
  localField: '_id', // what to go looking for in the other model
});

// DOCUMENT MIDDLEWARE runs before the save command and the create command (not
// on insertMany or update)
/* ---------------------------- Slugify the name ---------------------------- */
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.startTime = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (documents, next) {
  console.log(`Operation took ${Date.now() - this.startTime} ms`);
  next();
});

// AGGREGATOR MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  // adding additional aggregation from the model
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
