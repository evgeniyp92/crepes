const express = require('express');
const fs = require('fs');

// Initializing application
const app = express();
// adding middleware to allow receiving body
app.use(express.json());
// adding an additional function to the middleware stack
app.use((req, res, next) => {
  // we get access to the request, response, and the next function
  console.log('Hello from our custom middleware 💩');
  // without calling the next function the flow would hang
  next();
});

// manipulating the request object
app.use((req, res, next) => {
  // appending the time of the request to the request
  // @ts-ignore
  req.currentTime = new Date().toISOString();
  next();
});

// Setting the port
const PORT = 4000;

// loading files
const tours = JSON.parse(
  // @ts-ignore
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// declaring our functions
const getAllTours = (request, response) => {
  console.log(request.currentTime);
  response.json({
    status: 'success',
    requestedAt: request.currentTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};
const getTour = (request, response) => {
  const { params } = request;
  const tour = tours.find(element => element.id === Number(params.id));
  // controlling for insane request
  // general catch for if an id doesnt come back
  if (!tour) {
    return response.status(404).json({
      status: 'fail',
      reason: 'Invalid ID',
    });
  }
  // deterministically checking for an out of range id
  if (Number(params.id) > tours.length) {
    return response.status(404).json({
      status: 'fail',
      reason: 'id is not valid, probably too high!',
    });
  }
  // actually processing and responding if the checks pass
  response.json({
    status: 'success',
    params,
    data: {
      tour,
    },
  });
};
const createTour = (request, response) => {
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
};
const updateTour = ({ params, body }, response) => {
  // checking that the things we need exist
  if (!params || !body) {
    return response.status(404).json({
      status: 'fail',
      reason: 'please provide params and a body!',
    });
  }
  // checking that the id is in range
  if (Number(params.id) > tours.length) {
    return response.status(404).json({
      status: 'fail',
      reason: 'please provide a valid id!',
    });
  }
  // responding to the request
  response.json({
    status: 'success',
    params,
    body,
    data: {
      tour: 'updated tour here bro',
    },
  });
};
const deleteTour = ({ params }, response) => {
  // checking that the things we need exist
  if (!params.id) {
    return response.status(404).json({
      status: 'fail',
      reason: 'please provide an id!',
    });
  }
  // checking that the id is in range
  if (Number(params.id) > tours.length) {
    return response.status(404).json({
      status: 'fail',
      reason: 'please provide a valid id!',
    });
  }
  // responding to the request
  response.status(204).json({
    status: 'success',
    params,
    data: null,
  });
};

// declaring endpoints
// use a colon to denote a param, a ? makes it optional (:id?)
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// faster way of declaring routes than above
// declare the endpoint and then chain all applicable methods
app.route('/api/v1/tours').get(getAllTours).post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// Setting up a listen
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
