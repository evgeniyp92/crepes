const express = require('express');
const fs = require('fs');

// Initializing application
const app = express();
// Setting the port
const PORT = 4000;

// defining a route
// note that express requests are a bit more detailed than the node http lib
// app.get('/', (request, response) => {
//   response.status(200).json({
//     message: `Hello from the server side!`,
//     app: 'Natours',
//   });
// });

// app.post('/', (request, response) => {
//   response.send(`You can post to this endpoint 😳`);
// });

const tours = JSON.parse(
  // @ts-ignore
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (request, response) => {
  response.json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// Setting up a listen
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
