const { promisify } = require('util');
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
    passwordChangedAt: request.body.passwordChangedAt,
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

  // 3) If everything ok respond with JWT with user id included
  const token = signToken(user._id);
  response.json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (request, response, next) => {
  // Get the token and check if its there
  /** You can typically send a token as an http header, which can
  be accessed from `request.headers`
  The standard for supplying JWTs is below
  Authorization: Bearer [token here] */
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer')
  ) {
    token = request.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('Not logged in', 401));
  }
  console.log(token);

  // Validate and verify the token
  // We are going to promisify this method
  // If someone were to manipulate the token they would need to know the secret
  // to get it to pass verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // If verified, check if user exists
  /**
   * If the user has changed his pw or the user has been deleted tokens
   * should be invalid
   */
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('User does not exist', 401));
  }

  // Check if user changed pw after token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Token is expired, please log in again', 401));
  }

  // The JWT and request has passed all checks, give access
  request.user = freshUser;
  next();
});
