const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'No name specified'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'No price specified'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
