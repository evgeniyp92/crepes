const express = require('express');

// Initializing application
const app = express();
// Setting the port
const PORT = 4000;

// defining a route
// note that express requests are a bit more detailed than the node http lib
app.get('/', (request, response) => {
  response.status(200).json({
    message: `Hello from the server side!`,
    app: 'Natours',
  });
});

app.post('/', (request, response) => {
  response.send(`You can post to this endpoint 😳`);
});

// Setting up a listen
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
