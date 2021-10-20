//  reading a large file with streams

const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
  // using streams and avoiding back pressure from the readStream
  const readable = fs.createReadStream('test-file.txt');
  readable.pipe(res);
  // readableSource.pipe(writableDestination)
});

server.listen(8000, '127.0.0.1', () => {
  console.log(`server listening on port 8000`);
});
