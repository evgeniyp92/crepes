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

# Building HTML templates

We can replace boilerplate with placeholders in order to update programmatically

```html
<h2 class="product__name">{%PRODUCTNAME%}</h2>
<div class="product__details">
  <p><span class="emoji-left">🌍</span>From {%FROM%}</p>
  <p><span class="emoji-left">❤️</span>{%NUTRIENTS%}</p>
  <p><span class="emoji-left">📦</span>{%QUANTITY%}</p>
  <p><span class="emoji-left">🏷</span>{%PRICE%}€</p>
</div>

<a href="#" class="product__link">
  <span class="emoji-left">🛒</span>
  <span>Add to shopping card ({%PRICE%}€)</span>
</a>
```

# Filling templates

In order to work with templates we need to load them into memory

### Loading html

```javascript
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
```

### Replacing content in the page

The api endpoint

```javascript
if (pathName === '/overview' || pathName === '/') {
  response.writeHead(200, { 'Content-type': 'text/html' });

  const cardsHtml = dataObject
    .map(element => replaceTemplate(tempCard, element))
    .join('');

  const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

  response.end(output);
}
```

The function

```javascript
const replaceTemplate = (template, product) => {
  let output = template.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);
  if (!product.organic) {
    output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
  }
  return output;
};
```

# Parsing variables from URL

In order to be able to parse url params we need to load the url module

Parsing the url

```javascript
const server = http.createServer((request, response) => {
  console.log(request.url);
  console.log(url.parse(request.url, true));
  // you need to pass true as the second arg to parse the query into an object
  const pathName = request.url;
  // ... etc etc etc
```

```javascript
const { query, pathname } = url.parse(request.url, true);
```

# Using own modules

If we have a bunch of js files where we use a function repeatedly it makes sense to export it to a module

There are various ways of exporting modules which will be covered later

```javascript
export default (template, product) => {
  let output = template.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);
  if (!product.organic) {
    output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
  }
  return output;
};
```

# NPM and the package.json file

Node package manager is a CLI app that automatically comes with node that we
use to open and install packages from npm

It's actually the largest software registry in the world, fast approaching 1M
packages

In order to actually use it we need to initialize our project with `npm init`

This is what our package.json looks like to start

```json
{
  "name": "node-farm",
  "version": "1.0.0",
  "description": "Learning node.js",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Evgeniy Pimenov",
  "license": "ISC"
}
```

# Installing packages with NPM

We can install simple dependencies or development dependencies

Simple dependencies are code that we build upon to actually make our application
chooch

We used to have to specify `save` but you dont have to anymore

Dev dependencies are things you use in development but do not require in prod

To install something as a dev dep you need to write `--save-dev`

Nodemon reloads our environment whenever a change is detected

## Two types of installation

You can install packages locally or globally

Packages are installed locally by default and globally with `-g`

## Configuring nodemon to run with our project

Now instead of writing `node` we write `nodemon`

Nodemon fires a reload on every save of the document

It is effectively a wrapper around the node command to quickly cycle node in the
event of changes

If you dont install nodemon globally it wouldnt run from the cli

So you have to specify an npm script

```json
  "scripts": {
    "start": "nodemon index.js"
  },
```

In the above case nodemon will be coming from the `node_modules` folder.

To run the script this way we give `npm run start`.

Generally, global deps are dev tools because it doesnt make sense to install
them in every project

## Including third party modules in code

To add third party modules we simply use the require pattern

# Package versioning and updating

All packages follow `major, minor, patch` versioning

- Patches are for bugfixing
- Minor is for adding features but not breaking changes (so backward compatible)
- Major is for breaking changes (no guarantee of being backward compatible)

In node we can specify what updates to accept

```json
    "nodemon": "^2.0.13"
```

This specifies that we accept patches and minor updates but not major updates

You can go back and install old versions of packages if you choose i.e. `npm i slugify@1.0.0`

You can check if you have outdated packages by running `npm outdated`

`~` will only accept patch releases

`*` will accept all versions, even with breaking changes

delete packages with `npm uninstall`

the `node_modules` folder can get really oversized so make sure you dont push it up to github

since you have a `package.json` file you can just npm install from the machine you pull it down from

## The package-lock.json file

The package lock file tracks your dependencies as well as the dependencies of your depenedencies

This is important to ensure that code performs as expected across platforms

It along with your `package.json` is the blueprint for your application
