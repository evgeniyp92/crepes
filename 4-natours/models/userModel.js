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
  passwordChangedAt: Date,
});

// eslint-disable-next-line func-names
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
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
    console.log(changedTimeStamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStamp; // this will return true only if the password was changed after the token was issued
  }
  // false means not changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
