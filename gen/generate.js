const { MNPG } = require("@mikosramek/mnpg");

const ConfigHolder = require("./utils/ConfigHolder");
const Gen = require("./utils/Gen");
const Log = require("./utils/Log");
const compileSass = require("./utils/compileScss");
const compileIndex = require("./generators/indexPage");
const compilePages = require("./generators/projectPage");

const pageMeta = {
  "site-url": "https://www.mikosramek.ca",
  "share-image-url": "",
  description: "",
  title: "",
};

const generate = async () => {
  try {
    Log.header("Building Static Portfolio");
    Log.header("Cleaning Build");
    await Gen.cleanBuild();
    Log.pass("build cleaned");

    Log.header("Creating client");
    // Create client and load in schema from schema.json
    const client = new MNPG(
      ConfigHolder.PRISMIC_REPO,
      ConfigHolder.PRISMIC_ACCESS_TOKEN
    );
    client.createClient(await Gen.loadSchema());
    Log.pass("client created");

    Log.header("Compiling Index");
    await compileIndex(client, pageMeta);
    Log.pass("index compiled");

    // Additional pages / other generations
    Log.header("Compiling Pages");
    await compilePages(client, pageMeta);

    Log.header("Compiling sass");
    await compileSass();
    Log.pass("sass compiled");

    Log.header("Copying over /static/");
    Gen.copyOverStatic();
    Log.pass("static copied");
  } catch (error) {
    console.error(error);
  }
};

module.exports = generate;
