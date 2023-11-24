require("dotenv").config();
const generate = require("./generate");

// can add any post generation steps here
const run = async () => {
  await generate();
};

run();
