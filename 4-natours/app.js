const express = require('express');
const fs = require('fs');

// Initializing application
const app = express();
// adding middleware to allow receiving body
app.use(express.json());
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

// loading files
const tours = JSON.parse(
  // @ts-ignore
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// defining routes
app.get('/api/v1/tours', (request, response) => {
  response.json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

app.post('/api/v1/tours', (request, response) => {
  // first thing is to figure out the id of the object, since the db wont do it for us here
  // figuring out the id based on the length of the tours array
  const newId = tours[tours.length - 1].id + 1;
  // merging together an adhoc object and the request.body
  const newTour = Object.assign({ id: newId }, request.body);
  // pushing new item into tours array
  tours.push(newTour);
  // writing the new array to file
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    // supplying a stringified version of the object as data
    JSON.stringify(tours),
    // once the write is complete, we send a response indicating it is done
    error => {
      response.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
});

// Setting up a listen
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
