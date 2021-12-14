const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

/* --------------------------------- DELETE --------------------------------- */
exports.deleteOne = Model =>
  catchAsync(async (request, response, next) => {
    const doc = await Model.findByIdAndDelete(request.params.id);

    if (!doc) {
      return next(new AppError('No document found with id', 404));
    }

    response.status(204).json({
      status: 'success',
      data: null,
    });
  });

/* --------------------------------- UPDATE --------------------------------- */
exports.updateOne = Model =>
  catchAsync(async (request, response, next) => {
    const doc = await Model.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }

    response.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

/* --------------------------------- CREATE --------------------------------- */
exports.createOne = Model =>
  catchAsync(async (request, response, next) => {
    const doc = await Model.create(request.body);

    response.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

/* ---------------------------------- READ ---------------------------------- */
exports.getOne = (Model, popOptions) =>
  catchAsync(async (request, response, next) => {
    // saving the query into memory in case there are populates
    let query = Model.findById(request.params.id);
    // populating the populates
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with id', 404));
    }

    response.json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getAll = Model =>
  catchAsync(async (request, response, next) => {
    // if a tourId param exists, set the filter to respond with just the reviews
    // of that tour
    // this is here to allow for nested GET reviews (bit of a hack)
    let filter = {};
    if (request.params.tourId) filter = { tour: request.params.tourId };

    const features = new APIFeatures(Model.find(filter), request.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query.explain();

    response.json({
      status: 'success',
      results: doc.length,
      data: { doc },
    });
  });
