const _get = require("lodash.get");
const { MNPG } = require("@mikosramek/mnpg");

const ConfigHolder = require("./utils/ConfigHolder");
const Gen = require("./utils/Gen");
const Log = require("./utils/Log");
const compileSass = require("./utils/compileScss");
const { basePages } = require("./queries");

let client;
let schema;

let pageMeta = {
  "site-url": "https://www.mikosramek.ca",
  "share-image-url": "",
  description: "",
  title: "",
};

const compileIndex = async () => {
  try {
    // Create client and load in schema from schema.json
    client = new MNPG(
      ConfigHolder.PRISMIC_REPO,
      ConfigHolder.PRISMIC_ACCESS_TOKEN
    );
    schema = await Gen.loadSchema();

    client.createClient(schema);

    // get a single page
    const indexData = await client.getBasePages(basePages);

    // load in pages / slices
    // from gen/pages/index.html
    const indexTemplate = await Gen.loadPage("index");

    // from gen/slices/indexHeader.html
    const metaTemplate = await Gen.loadSlice("meta");

    const index = _get(indexData, "allHomes.edges[0].node", {});

    // setup meta
    const headshot = _get(index, "headshot", { url: "", alt: "" });
    const heroImage = _get(index, "hero_image", { url: "", alt: "" });
    const pageTitle = _get(index, "title", "");

    pageMeta.description = _get(index, "description", "");
    pageMeta["share-image-url"] = headshot.url;
    pageMeta.title = pageTitle;

    Log.subtitle("Populating Meta slice");
    const meta = Gen.replaceAllKeys(
      {
        ...pageMeta,
      },
      metaTemplate
    );

    // replace the indexTemplate with values
    Log.subtitle("Populating index page");
    const indexHTML = Gen.replaceAllKeys(
      {
        // replacement sections
        meta,
        // replacement keys
        "page-title": pageTitle,
        subtitle: _get(index, "subtitle", ""),
        "hero-image-url": heroImage.url,
        "headshot-url": headshot.url,
        "headshot-alt": headshot.alt,
      },
      indexTemplate
    );

    Gen.testForMissingKeys(indexHTML, "index.html");

    // write the index file
    await Gen.writeFile("index", indexHTML);
  } catch (error) {
    console.error(error);
  }
};

const generate = async () => {
  try {
    Log.header("Building Static Portfolio");
    Log.header("Cleaning Build");
    await Gen.cleanBuild();
    Log.pass("build cleaned");

    Log.header("Compiling Index");
    await compileIndex();
    Log.pass("index compiled");

    // Additional pages / other generations
    // Log.header("Compiling Pages");
    //
    // Log.pass("Done");

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
