const fs = require('fs');
const http = require('http');
const url = require('url');

const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

// The synchronous code blocks execution, which in this case is the POINT
// It also executes only once

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObject = JSON.parse(data);

const slugs = dataObject.map(element =>
  // @ts-ignore
  slugify(element.productName, {
    lower: true,
  })
);

console.log(slugs);

const server = http.createServer((request, response) => {
  const { query, pathname } = url.parse(request.url, true);

  console.log(pathname);
  console.log(query);

  // Overview page
  if (pathname === '/overview' || pathname === '/') {
    response.writeHead(200, { 'Content-type': 'text/html' });

    const cardsHtml = dataObject
      .map(element => replaceTemplate(tempCard, element))
      .join('');

    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

    response.end(output);

    // Product page
  } else if (pathname === '/product') {
    // @ts-ignore
    const product = dataObject[query.id];
    const output = replaceTemplate(tempProduct, product);

    response.writeHead(200, { 'Content-type': 'text/html' });
    response.end(output);

    // API
  } else if (pathname === '/api') {
    response.writeHead(200, {
      'Content-type': 'application/json',
    });
    response.end(data);

    // Not found
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
