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
// ⬇️ DO NOT UPDATE PASSWORDS WITH THIS
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

/* ----------------------- VIEW OWN INFO (MIDDLEWARE) ----------------------- */
exports.getMe = (request, response, next) => {
  // getOne wants req.params.id and we have the id from the protect function
  // so we simply set params.id to be equal to user.id
  request.params.id = request.user.id;
  next();
};

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
