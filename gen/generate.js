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

    Log.subtitle("Parsing Sections");
    const sections = {};
    _get(index, "body", []).forEach(({ primary, fields }) => {
      const name = _get(primary, "name", "!! name missing !!");
      sections[name] = [];
      fields.forEach(({ page_link }) => {
        const heading = _get(page_link, "heading", "!! heading missing !!");
        const image = _get(page_link, "header_image", { url: "", alt: "" });
        const slug = _get(page_link, "_meta.uid", "!!missing_uid!!");
        sections[name].push({ heading, image, slug });
      });
    });
    Log.pass("sections parsed");

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

    Log.subtitle("Generating Nav");
    const navItemTemplate = await Gen.loadSlice("nav-item");
    let navHTML = "";
    Object.keys(sections).forEach((sectionName) => {
      navHTML += Gen.replaceAllKeys(
        {
          section: sectionName,
        },
        navItemTemplate
      );
    });

    // replace the indexTemplate with values
    Log.subtitle("Populating index page");
    const indexHTML = Gen.replaceAllKeys(
      {
        // replacement sections
        meta,
        nav: navHTML,
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
    Log.subtitle("Writing index html file");
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
