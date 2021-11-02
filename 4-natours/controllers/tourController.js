const Tour = require('../models/tourModel');

exports.checkBody = (request, response, next) => {
  if (!request.body.name || !request.body.price) {
    return response.status(400).json({
      status: 'Fail',
      reason: 'Didnt provide a required parameter',
      requiredParameters: ['name', 'price'],
    });
  }
  next();
};

exports.getAllTours = (request, response) => {
  console.log(request.currentTime);
  response.json({
    status: 'success',
    requestedAt: request.currentTime,
    // results: tours.length,
    // data: {
    //   tours,
    // },
  });
};

exports.getTour = (request, response) => {
  const id = request.params.id * 1;

  // response.json({
  //   status: 'success',
  //   params: request.params,
  //   data: {
  //     tour,
  //   },
  // });
};

exports.createTour = (request, response) => {
  response.status(201).json({
    status: 'success',
    // data: {
    //   tour: newTour,
    // },
  });
};

exports.updateTour = ({ params, body }, response) => {
  response.json({
    status: 'success',
    params,
    body,
    data: {
      tour: 'updated tour here bro',
    },
  });
};

exports.deleteTour = ({ params }, response) => {
  response.status(204).json({
    status: 'success',
    params,
    data: null,
  });
};
