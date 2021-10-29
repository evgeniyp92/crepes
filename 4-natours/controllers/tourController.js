const fs = require('fs');

// all the router logic at this point has been extracted to its own file
const tours = JSON.parse(
  // @ts-ignore
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkId = (request, response, next, paramValue) => {
  console.log(`Tour id is ${paramValue}`);
  if (request.params.id * 1 > tours.length) {
    return response.status(404).json({
      status: 'Fail',
      reason: 'Invalid ID',
    });
  }
  next();
};

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
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (request, response) => {
  const tour = tours.find(element => element.id === Number(request.params.id));
  response.json({
    status: 'success',
    params: request.params,
    data: {
      tour,
    },
  });
};

exports.createTour = (request, response) => {
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
