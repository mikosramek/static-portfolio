const _get = require("lodash.get");
const Gen = require("../utils/Gen");
const Log = require("../utils/Log");
const { basePages } = require("../queries");

const compileIndex = async (client, pageMeta) => {
  try {
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
        const image = _get(page_link, "header_image.home", {
          url: "",
          alt: "",
        });
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

    Log.subtitle("Generating Meta");
    const metaHTML = Gen.replaceAllKeys(
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
        navItemTemplate,
        true
      );
    });
    Log.pass("nav generated");

    Log.subtitle("Generating Sections");
    let mainHTML = "";
    const sectionTemplate = await Gen.loadSlice("sections/section");
    const sectionItemTemplate = await Gen.loadSlice("sections/item");
    Object.entries(sections).forEach(([name, items]) => {
      Log.subtitle(name);
      let listHTML = "";
      items.forEach((item) => {
        Log.note(item.slug);
        const itemHTML = Gen.replaceAllKeys(
          {
            link: item.slug,
            src: item.image.url,
            alt: item.image.alt,
            name: item.heading,
          },
          sectionItemTemplate
        );
        listHTML += itemHTML;
      });

      Log.note("section");
      const sectionHTML = Gen.replaceAllKeys(
        {
          "section-name": name,
          list: listHTML,
        },
        sectionTemplate
      );
      mainHTML += sectionHTML;
    });

    // replace the indexTemplate with values
    Log.subtitle("Populating index page");
    const indexHTML = Gen.replaceAllKeys(
      {
        // replacement sections
        meta: metaHTML,
        main: mainHTML,
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

module.exports = compileIndex;
