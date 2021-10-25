const fs = require('fs');
const superagent = require('superagent');

const readFilePro = file => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (error, data) => {
      if (error) reject(`Could not find file.`);
      resolve(data);
    });
  });
};

const writeFilePro = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, err => {
      if (err) reject(`Could not write to file`);
      resolve(`Success`);
    });
  });
};

const getDogPic = async () => {
  try {
    const data = await readFilePro(`${__dirname}/dog.txt`);
    console.log(`Breed: ${data}`);

    const responsePromise1 = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const responsePromise2 = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const responsePromise3 = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const allResponses = await Promise.all([
      responsePromise1,
      responsePromise2,
      responsePromise3,
    ]);

    const images = allResponses.map(element => element.body.message);
    console.log(images);

    await writeFilePro('dog-img.txt', images.join('\n'));
    console.log(`dog written to file 🗄 🐶`);
  } catch (error) {
    console.log(error);
    throw error;
  }
  return `2: BORF BORF BORF 🐕`;
};

(async () => {
  try {
    console.log(`1: Will get dog pics`);
    getDogPic().then(response => {
      console.log(response);
      console.log(`3: Done getting dog pics`);
    });
  } catch (error) {
    console.log(`Error!`);
  }
})();

// console.log(`1: will get dog pics`);
// getDogPic().then(x => {
//   console.log(x);
//   console.log(`3: done getting dog pics`);
// });

// readFilePro(`${__dirname}/dog.txt`)
//   .then(data => {
//     return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
//   })
//   .then(result => {
//     return writeFilePro('dog-image.txt', result.body.message);
//   })
//   .then(() => {
//     console.log(`wrote the dog to file 🐶🗃`);
//   })
//   .catch(error => {
//     console.log(error.message);
//   });

// fs.readFile(`${__dirname}/dog.txt`, (error, response1) => {
//   console.log(`Breed: ${response1}`);

//   superagent
//     .get(`https://dog.ceo/api/breed/${response1}/images/random`)
//     .then(result => {
//       console.log(result.body.message);

//       fs.writeFile('dog-image.txt', result.body.message, error => {
//         if (error) console.log(error.message);
//         console.log(`dog saved to file`);
//       });
//     })
//     .catch(error => {
//       console.log(error.message);
//     });
// });
