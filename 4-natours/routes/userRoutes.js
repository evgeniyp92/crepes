const express = require('express');

// all the router logic at this point has been extracted to its own file

const getAllUsers = (request, response) => {
  response.status(500).json({
    status: 'error',
    reason: 'endpoint not yet implemented',
  });
};

const createUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    reason: 'endpoint not yet implemented',
  });
};

const getUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    reason: 'endpoint not yet implemented',
  });
};

const updateUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    reason: 'endpoint not yet implemented',
  });
};

const deleteUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    reason: 'endpoint not yet implemented',
  });
};

const router = express.Router();

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
