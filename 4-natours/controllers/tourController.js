const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopTours = (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-ratingsAverage,price';
  request.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (request, response) => {
  try {
    const features = new APIFeatures(Tour.find(), request.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const allTours = await features.query;

    // query.sort().select().skip().limit()

    // using mongoose to execute the search
    // const query = Tour.find()
    //   .where('duration')
    //   .equals(request.query.duration)
    //   .where('difficulty')
    //   .equals(request.query.difficulty);

    // SEND RESPONSE
    response.json({
      status: 'success',
      results: allTours.length,
      data: { ...allTours },
    });
  } catch (error) {
    response.status(404).json({
      status: 'fail',
      reason: error,
    });
  }
};

exports.getTour = async (request, response) => {
  try {
    // Here the id is from the url
    // findById is just a helper function for findOne
    const tour = await Tour.findById(request.params.id);
    response.json({
      status: 'success',
      params: request.params,
      data: {
        tour,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: 'fail',
      reason: error,
    });
  }
};

exports.createTour = async (request, response) => {
  try {
    // Creating an instance of a Tour and then calling its methods
    // const newTour = new Tour({});
    // newTour.save();

    // Rawdogging it and calling the method off the parent
    const newTour = await Tour.create(request.body);

    response.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    response.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
      details: error,
    });
  }
};

exports.updateTour = async (request, response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
      // respond with the updated document
      new: true,
      // run the validators on the new object
      runValidators: true,
    });

    response.json({
      status: 'success',
      params: request.params,
      body: request.body,
      data: {
        tour,
      },
    });
  } catch (error) {
    response.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
      details: error,
    });
  }
};

exports.deleteTour = async (request, response) => {
  try {
    await Tour.findByIdAndDelete(request.params.id);
    response.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    response.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.getTourStats = async (request, response) => {
  try {
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
  } catch (error) {
    response.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getMonthlyPlan = async (request, response) => {
  try {
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
  } catch (error) {
    response.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
