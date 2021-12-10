const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
