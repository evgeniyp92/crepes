const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// helper function to sign a token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsync(async (request, response, next) => {
  const userToCreate = {
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
  };

  const newUser = await User.create(userToCreate);

  const token = signToken(newUser._id);

  response.status(201).json({
    status: 'success',
    token,
    data: { user: newUser },
  });
});

exports.login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;
  // 1) Check if email and passwords exist in the request
  if (!email || !password) {
    return next(new AppError('No e-mail or password specified', 400));
  }

  // 2) Check if the user exists, and also pull in the password for later
  const user = await User.findOne({ email }).select('+password');

  // if there is no user or the evaluation of passwords fails, send an error
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('The username or password is invalid', 401));
  }

  // 3) If everything ok respond with JWT
  const token = signToken(user._id);
  response.json({
    status: 'success',
    token,
  });
});
