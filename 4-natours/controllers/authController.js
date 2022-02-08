const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

/* ------------------- Helper function to sign a token ---------------------- */
const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

/* --------------------- Helper function to send a token -------------------- */
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 1000
    ),
    httpOnly: true,
  };

  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

/* --------------------------- restrictTo function -------------------------- */

// if the roles dont match up, throw an error
// otherwise continue
// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
  return (request, response, next) => {
    if (!roles.includes(request.user.role)) {
      return next(new AppError('Insufficient rights', 403));
    }

    next();
  };
};

/* ------------------------------- USER SIGNUP ------------------------------ */
exports.signUp = catchAsync(async (request, response, next) => {
  const userToCreate = {
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
    // passwordChangedAt: request.body.passwordChangedAt,
  };

  const newUser = await User.create(userToCreate);

  // const token = signToken(newUser._id);

  // response.status(201).json({
  //   status: 'success',
  //   token,
  //   data: { user: newUser },
  // });

  sendToken(newUser, 201, response);
});

/* ---------------------------------- LOGIN --------------------------------- */
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

  response.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 1000
    ),
    httpOnly: true,
  });

  response.json({
    status: 'success',
    token,
  });
});

/* --------------------------- ISLOGGEDIN FUNCTION -------------------------- */
// Only for rendered pages, no error handling
exports.isLoggedIn = catchAsync(async (request, response, next) => {
  let token;
  if (request.cookies.jwt) {
    token = request.cookies.jwt;
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }

    // if all the above passes the user is logged in, make the user accessible
    // to the template
    response.locals.user = currentUser;
    return next();
  }
  next();
});

/* ---------------------------- PROTECT FUNCTION ---------------------------- */
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
  } else if (request.cookies.jwt) {
    token = request.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Not logged in', 401));
  }

  // Validate and verify the token. We are going to promisify this method. If
  // someone were to manipulate the token they would need to know the secret to
  // get it to pass verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // If verified, check if user exists
  /**
   * If the user has changed his pw or the user has been deleted tokens
   * should be invalid
   */
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('User does not exist', 401));
  }

  // Check if user changed pw after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Token is expired, please log in again', 401));
  }

  // The JWT and request has passed all checks, give access
  request.user = currentUser;
  next();
});

/* -------------------- FORGOT PASSWORD (UNAUTHENTICATED) ------------------- */
exports.forgotPassword = catchAsync(async (request, response, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: request.body.email });
  if (!user) {
    return next(new AppError('No user with that email address', 404));
  }
  // 2) Generate random reset token
  const resetToken = user.createPasswordResetToken();

  // we've updated the current document in our model but we still need to save
  // it to db. You have to turn off validators for this particular instance
  // otherwise validators run and fail the request, because of lacking fields
  await user.save({ validateBeforeSave: false });

  // 3) Send it back as an email
  const resetURL = `${request.protocol}://${request.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? You fucker. Submit a PATCH request with your new password and password confirm to ${resetURL}. \n If you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token',
      text: message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(`There was an error sending the email, try again later`, 500)
    );
  }

  response.json({
    status: 'success',
    message: 'reset token issued',
  });
});

/* ------------- Reset password (AUTHENTICATED WITH EMAIL TOKEN) ------------ */
exports.resetPassword = catchAsync(async (request, response, next) => {
  // 1) Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(request.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token hasnt expired and user exists, set a new password
  if (!user) {
    return next(new AppError('The token has expired. Please try again.'));
  }
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 4) Log the user in and send a JWT
  const token = signToken(user._id);
  response.json({
    status: 'success',
    token,
  });
  // 3) Update passwordChangedAt
});

/* ----------------------- Update password (WITH JWT) ----------------------- */
exports.updatePassword = catchAsync(async (request, response, next) => {
  // 1) Get user from collection
  const user = await User.findById(request.user._id).select('+password');
  // 2) Check if the posted password is correct
  if (!request.body.password || !request.body.passwordConfirm) {
    const err =
      'Fucker. You must provide a new password and/or a password confirmation';
    return next(new AppError(err, 400));
  }
  if (await user.correctPassword(request.body.password, user.password)) {
    const err = 'Password cannot be same as old password';
    return next(new AppError(err, 403));
  }
  // 3) If the password is correct, update password
  if (!(request.body.password === request.body.passwordConfirm)) {
    const err = 'Password and password confirmation does not match';
    return next(new AppError(err, 403));
  }
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  await user.save();
  // 4) Log the user in with a reissued JWT
  sendToken(user, 201, response);
});
