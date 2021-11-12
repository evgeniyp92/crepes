/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DB_CONN_STRING.replace(
  '<PASSWORD>',
  process.env.DB_ADM_PASSWORD
);

process.on('uncaughtException', (error) => {
  console.error(`UNCAUGHT EXCEPTION, SHUTTING DOWN`);
  console.log(error);
  process.exit(1);
});

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

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App running on port ${port}...`);
});

// handling promise rejections
process.on('unhandledRejection', (error) => {
  console.warn(error.name, error.message);
  console.error(`UNHANDLED REJECTION, SHUTTING DOWN...`);
  server.close(() => process.exit(1));
});
