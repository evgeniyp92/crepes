const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-ratingsAverage,price';
  request.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.createTour = catchAsync(async (request, response, next) => {
  const newTour = await Tour.create(request.body);

  response.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.getAllTours = catchAsync(async (request, response, next) => {
  const features = new APIFeatures(Tour.find(), request.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const allTours = await features.query;

  response.json({
    status: 'success',
    results: allTours.length,
    data: { ...allTours },
  });
});

exports.getTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findById(request.params.id);

  if (!tour) {
    return next(new AppError('Requested tour does not exist', 404));
  }

  response.json({
    status: 'success',
    params: request.params,
    data: {
      tour,
    },
  });
});

exports.updateTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
    // respond with the updated document
    new: true,
    // run the validators on the new object
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('Requested tour does not exist', 404));
  }

  response.json({
    status: 'success',
    params: request.params,
    body: request.body,
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findByIdAndDelete(request.params.id);

  if (!tour) {
    return next(new AppError('Requested tour does not exist', 404));
  }

  response.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (request, response, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);
  response.json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (request, response, next) => {
  const year = request.params.year * 1; // 2021
  const plan = await Tour.aggregate([
    {
      // unwinding startDates into own documents
      $unwind: '$startDates',
    },
    {
      $match: {
        // filtering for tours that only start in the param year
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        // grouping entries by month and selecting data to display
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      // adding a human readable field for the month
      $addFields: { month: '$_id' },
    },
    {
      // sorting by amount of tour starts, descending
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      // removing the id field from the return
      $project: {
        _id: 0,
      },
    },
    {
      // limiting the return to 12
      $limit: 12,
    },
  ]);
  response.json({
    status: 'success',
    results: plan.length,
    data: { ...plan },
  });
});
