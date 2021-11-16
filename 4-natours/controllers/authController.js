const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signUp = catchAsync(async (request, response, next) => {
  const newUser = await User.create(request.body);

  response.status(201).json({
    status: 'success',
    data: { user: newUser },
  });
});
