const Tour = require('../models/tourModel');

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

exports.createTour = async (request, response) => {
  try {
    // Creating an instance of a Tour and then calling its methods
    // const newTour = new Tour({});
    // newTour.save();

    // Rawdogging it and calling the method off the parent
    const newTour = await Tour.create(request.body);

    response.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    response.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
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
