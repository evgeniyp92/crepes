const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObject[el] = obj[el];
  });
  return newObject;
};

exports.getAllUsers = catchAsync(async (request, response, next) => {
  const allUsers = await User.find();

  response.json({
    status: 'success',
    results: allUsers.length,
    data: { ...allUsers },
  });
});

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
  // since we are not handling sensitive data here its fine to use findbyidandupdate
  const updatedUser = await User.findByIdAndUpdate(request.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  response.json({
    status: 'success',
    data: updatedUser,
  });
});

exports.createUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    reason: 'endpoint not yet implemented',
  });
};

exports.getUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    reason: 'endpoint not yet implemented',
  });
};

exports.updateUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    reason: 'endpoint not yet implemented',
  });
};

exports.deleteUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    reason: 'endpoint not yet implemented',
  });
};
