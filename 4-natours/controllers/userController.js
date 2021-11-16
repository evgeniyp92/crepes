const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (request, response, next) => {
  const allUsers = await User.find();

  response.json({
    status: 'success',
    results: allUsers.length,
    data: { ...allUsers },
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
