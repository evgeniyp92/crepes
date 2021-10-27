const fs = require('fs');
const express = require('express');

// all the router logic at this point has been extracted to its own file
const tours = JSON.parse(
  // @ts-ignore
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

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

const router = express.Router();

router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
