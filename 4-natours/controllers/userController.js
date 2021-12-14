const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

/* ----------------------------- FILTER OBJECTS ----------------------------- */
const filterObj = (obj, allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObject[el] = obj[el];
  });
  return newObject;
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); // DO NOT UPDATE PASSWORDS WITH THIS
exports.deleteUser = factory.deleteOne(User);

/* ----------------------------- UPDATE OWN INFO ---------------------------- */
exports.updateMe = catchAsync(async (request, response, next) => {
  if (Object.keys(request.body).length === 0) {
    const err = 'Please provide a body for the request';
    return next(new AppError(err, 400));
  }
  if (request.body.password || request.body.passwordConfirm) {
    const err = 'Do not attempt to update passwords here, use /update-password';
    return next(new AppError(err, 400));
  }
  // filter out restricted fields
  const filteredBody = filterObj(request.body, ['name', 'email']);
  // since we are not handling sensitive data here its fine to use
  // findbyidandupdate
  const updatedUser = await User.findByIdAndUpdate(
    request.user._id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );
  response.json({
    status: 'success',
    data: updatedUser,
  });
});

/* ----------------------- VIEW OWN INFO (MIDDLEWARE) ----------------------- */
exports.getMe = (request, response, next) => {
  request.params.id = request.user.id;
  next();
};

/* --------------------------- DELETE OWN PROFILE --------------------------- */
exports.deleteMe = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });

  response.status(204).json({
    status: 'success',
    data: null,
  });
});

/* ------------------------ CREATE USER (NOT SIGNUP) ------------------------ */
exports.createUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    reason: 'Endpoint is a stub, please use /signup',
  });
};
