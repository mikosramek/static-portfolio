const _get = require("lodash.get");
const { MNPG } = require("@mikosramek/mnpg");

const ConfigHolder = require("./utils/ConfigHolder");
const Gen = require("./utils/Gen");
const Log = require("./utils/Log");
const compileSass = require("./utils/compileScss");
const { basePages } = require("./queries");

let client;
let schema;

const compileIndex = async () => {
  try {
    // load in pages / slices
    // from gen/pages/index.html
    const indexTemplate = await Gen.loadPage("index");

    // from gen/slices/indexHeader.html
    // const headerTemplate = await Gen.loadSlice("indexHeader");

    // Create client and load in schema from schema.json
    client = new MNPG(
      ConfigHolder.PRISMIC_REPO,
      ConfigHolder.PRISMIC_ACCESS_TOKEN
    );
    schema = await Gen.loadSchema();

    client.createClient(schema);

    // get a single page
    const indexData = await client.getBasePages(basePages);
    const index = _get(indexData, "allHomes.edges[0].node", {});

    // replace the indexTemplate with values
    const indexHTML = Gen.replaceAllKeys(
      {
        // replacement keys
        "page-title": _get(index, "title", ""),
      },
      indexTemplate
    );

    // write the index file
    await Gen.writeFile("index", indexHTML);
  } catch (error) {
    console.error(error);
  }
};

const generate = async () => {
  try {
    Log.header("Cleaning Build");
    await Gen.cleanBuild();
    Log.pos("Done");

    Log.header("Compiling Index");
    await compileIndex();
    Log.pos("Done");

    // Additional pages / other generations
    // Log.header("Compiling Pages");
    //
    // Log.pos("Done");

    Log.header("Compiling sass");
    await compileSass();
    Log.pos("Done");

    Log.header("Copying over /static/");
    Gen.copyOverStatic();
    Log.pos("Done");
  } catch (error) {
    console.error(error);
  }
};

module.exports = generate;
