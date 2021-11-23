/* eslint-disable func-names */
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // name, email, photo, password, passwordconfirm
  name: {
    type: String,
    required: [true, 'No name specified'],
  },
  email: {
    type: String,
    required: [true, 'No E-Mail specified'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'E-Mail is invalid'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'No password specified'],
    minlength: [8, 'Password is too short'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Must confirm password'],
    validate: {
      validator(el) {
        return el === this.password;
      },
      message: 'Passwords must match',
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// eslint-disable-next-line func-names
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.pre('save', function (next) {
  // if password hasnt been modified or document is new dont do anything
  if (!this.isModified('password') || this.isNew) return next();
  // set the password changed at to 10s in the past to avoid race conditions
  // with the JWT
  this.passwordChangedAt = Date.now() - 10000;
  next();
});

// only returning documents that are active
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// eslint-disable-next-line func-names
// check if the passwords match
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimeStamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStamp; // this will return true only if the password was changed after the token was issued
  }
  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken });
  console.log(this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
