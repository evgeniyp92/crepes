const mongoose = require('mongoose');
const validator = require('validator');

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
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Must confirm password'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
