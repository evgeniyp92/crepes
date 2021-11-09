const Tour = require('../models/tourModel');

exports.getAllTours = async (request, response) => {
  try {
    // 1A. BUILD QUERY
    const queryObj = { ...request.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((element) => delete queryObj[element]);

    // 1B. ADVANCED FILTERING
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (matchedTerm) => `$${matchedTerm}`
    );

    let query = Tour.find(JSON.parse(queryString));

    // 2. SORTING
    if (request.query.sort) {
      const sortBy = request.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 3. FIELD LIMITING
    if (request.query.fields) {
      // create a string of selected fields and process it
      const fields = request.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      // exclude the v field
      query.select('-__v');
    }

    // 4. PAGINATION
    // http://localhost:4000/api/v1/tours?page=2&limit=10
    const page = request.query.page * 1 || 1;
    const limit = request.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // 1-10 page 1, 11-20 page 2, 21-30 page 3 etc etc
    query = query.skip(skip).limit(limit);

    if (request.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist.');
    }

    // EXECUTE QUERY
    const allTours = await query;
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
