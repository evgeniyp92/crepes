const fs = require('fs');
const crypto = require('crypto');

const start = Date.now();
// @ts-ignore
process.env.UV_THREADPOOL_SIZE = 4;

// this executes second
setTimeout(() => console.log('Timer 1 finished'), 0);

// this executes third
setImmediate(() => console.log('Immediate timer finished'));

// this executes fourth
fs.readFile('test-file.txt', () => {
  console.log('I/O finished');
  setTimeout(() => console.log(`Timer 2 finished`), 1000);
  setImmediate(() => console.log('Immediate 2 finished'));

  process.nextTick(() => console.log('Process.nexTick()'));

  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'password encrypted');
  });
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'password encrypted');
  });
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'password encrypted');
  });
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'password encrypted');
  });
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'password encrypted');
  });
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'password encrypted');
  });
});
// this executes first
console.log('Hello from top-level code');
