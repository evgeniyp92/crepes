const fs = require('fs');
const http = require('http');
const url = require('url');

// The synchronous code blocks execution, which in this case is the POINT
// It also executes only once
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObject = JSON.parse(data);

const server = http.createServer((request, response) => {
  const pathName = request.url;

  if (pathName === '/overview' || pathName === '/') {
    response.end(`This is the overview`);
  } else if (pathName === '/product') {
    response.end(`This is the product`);
  } else if (pathName === '/api') {
    response.writeHead(200, {
      'Content-type': 'application/json',
    });
    response.end(data);
  } else {
    response.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'helloworld',
    });
    response.end(`<h1>This page could not be found 🤖</h1>`);
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log(`Listening to requests on port 8000`);
});
