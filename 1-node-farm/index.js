const fs = require('fs');
const http = require('http');
const url = require('url');

const server = http.createServer((request, response) => {
  const pathName = request.url;

  if (pathName === '/overview' || pathName === '/') {
    response.end(`This is the overview`);
  } else if (pathName === '/product') {
    response.end(`This is the product`);
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
