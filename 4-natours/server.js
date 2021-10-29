const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DB_CONN_STRING.replace(
  '<PASSWORD>',
  process.env.DB_ADM_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((connection) => {
    console.log(`MongoDB Connected!`);
  });

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

const testTour = new Tour({
  name: 'The Park Camper',
  price: 297,
});

testTour
  .save()
  .then((document) => {
    console.log(document);
  })
  .catch((error) => {
    console.log(`ERROR 🤖💥: ${error}`);
  });

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App running on port ${port}...`);
});
