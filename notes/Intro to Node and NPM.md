# Introduction to Node and NPM

Node is fundamentally a Javascript runtime

Node.js uses V8 to run JS code

## Now that JS is outside the browser it makes JS much more powerful

You can finally use JS on the server side of development

### It is great for backend development because

- Node is singlethreaded and based on an event driven non-blocking IO model
- Its perfect for building fast and scalable data intensive apps
- JS across the entire stack means faster and more efficient development
- NPM is an enormous library of open-source packages available to everyone for
  free
- The developer community is very active

### Node uses

- API with DB (preferably NoSQL)
- Data streaming (Youtube)
- Real-time chat application
- Server-side web application

### Don't use node for

- Heavy server side processing (better to use RoR, php or python)

# Using modules

To run javascript with node simply call node with the path to the file you wish
to run

The node docs are available at the nodejs website

# Blocking and Non-blocking

```javascript
const fs = require('fs');

// reading data from files
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log(textIn);

const textOut = `This is what we know about the avocado: ${textIn}
  Created on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', textOut);
```

The code to read and write the text was synchronous. Synchronous code can become
problematic if you have slow operations however, because it blocks execution of
other code (hence, 'blocking')

The solution is to use async, non-blocking code

Node processes only run on a single thread, so when one user potentially blocks
access to all users everyone has to wait for that one guy to finish doing what
he's doing

So you should always try to use async code, which runs tasks in the background
(more on this later)

Node is actually completely designed around callbacks, its a very different
paradigm from things like php

Ultimately the callback paradigm is more performant at scale. Callbacks dont
necessarily make them async though.

Must be careful of avoiding callback hell however

In order to avoid callback hell we can use Promises or Async/Await

For now we will stick to callbacks

```javascript
const fs = require('fs');

// reading data from files in a blocking, synchronous way
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log(textIn);

const textOut = `This is what we know about the avocado: ${textIn}
Created on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', textOut);

// reading data in a non-blocking, async way
fs.readFile('./txt/start.txt', 'utf-8', (error, data) => {
  console.log(data);
});
console.log('Will read file!');

// reading data async with a callback
fs.readFile('./txt/start.txt', 'utf-8', (error, data1) => {
  fs.readFile(`./txt/${data1}.txt`, 'utf-8', (error, data2) => {
    console.log(data2);
  });
});

// reading data async with third callback
fs.readFile('./txt/start.txt', 'utf-8', (error, data1) => {
  fs.readFile(`./txt/${data1}.txt`, 'utf-8', (error, data2) => {
    console.log(data2);
    fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
      console.log(data3);
    });
  });
});

// writing data async
fs.readFile('./txt/start.txt', 'utf-8', (error, data1) => {
  if (error) return console.log(`ERROR 🤖`);

  fs.readFile(`./txt/${data1}.txt`, 'utf-8', (error, data2) => {
    console.log(data2);
    fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
      console.log(data3);

      fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
        console.log(`file written! 💩`);
      });
    });
  });
});
```

Important to remember that callback functions do not get their own lexical this

# Creating a simple web server

In order to build a server we have to do two things

- Build it
- Start it

A super simple http server

```javascript
const fs = require('fs');
const http = require('http');

const server = http.createServer((request, response) => {
  response.end('Hello from the other side 🤖');
});

server.listen(8000, '127.0.0.1', () => {
  console.log(`Listening to requests on port 8000`);
});
```

# Routing in a web server

Routing can get kind of messy so we can use Express or React-Router in the real
world

This will be routing done from scratch however

The url module isnt strictly necessary in a project this simple but will come
in handy in larger projects, reading params and values in particular

## HTTP Headers

Headers are a piece of response that we send back

Headers can be predefined or your own, but must always be sent before the response content

```javascript
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
```

# APIs

## Whats an api anyway?

It's a service from which we can request data

Node gives you access to something called dirname, which is the path from which the js file is being executed, and not the current directory, which can sometimes not match!

```javascript
__dirname;
```

```javascript
const fs = require('fs');
const http = require('http');
const url = require('url');

const server = http.createServer((request, response) => {
  const pathName = request.url;

  if (pathName === '/overview' || pathName === '/') {
    response.end(`This is the overview`);
  } else if (pathName === '/product') {
    response.end(`This is the product`);
  } else if (pathName === '/api') {
    fs.readFile(`${__dirname}/dev-data/data.json`, 'utf-8', (error, data) => {
      const productData = JSON.parse(data);
      response.writeHead(200, {
        'Content-type': 'application/json',
      });
      response.end(data);
    });
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
```

After refactoring to remove the file read from the api point

```javascript
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
```
