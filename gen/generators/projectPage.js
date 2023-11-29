const _get = require("lodash.get");
const Gen = require("../utils/Gen");
const Log = require("../utils/Log");
const { firstEntries, entries } = require("../queries");

let pageTemplate,
  pageHeaderTemplate,
  pageSubheadingTemplate,
  pageParagraphTemplate,
  pageImageTemplate,
  pageHeaderLinkListTemplate,
  pageHeaderLinkTemplate,
  metaTemplate;

const compilePages = async (client, pageMeta) => {
  try {
    Log.subtitle("Getting page data");
    // load client data
    const pages = await client.getEntries(firstEntries, entries, "allPages");
    Log.pass("page data retrieved");

    // load templates into memory
    pageTemplate = await Gen.loadPage("project");
    pageHeaderTemplate = await Gen.loadSlice("page/header");
    pageSubheadingTemplate = await Gen.loadSlice("page/subheading");
    pageParagraphTemplate = await Gen.loadSlice("page/paragraph");
    pageImageTemplate = await Gen.loadSlice("page/image");
    pageHeaderLinkListTemplate = await Gen.loadSlice("page/headerLinkList");
    pageHeaderLinkTemplate = await Gen.loadSlice("page/headerLink");
    metaTemplate = await Gen.loadSlice("meta");

    for (let i = 0; i < pages.length; i += 1) {
      await compileSinglePage(pages[i], pageMeta);
    }
  } catch (error) {
    console.error(error);
  }
};

const compileParagraph = (slice) => {
  const paragraphs = _get(slice, "primary.copy", []) ?? [];
  return paragraphs
    .map((p) => {
      const copy = _get(p, "text", "");
      return Gen.replaceAllKeys({ copy }, pageParagraphTemplate);
    })
    .join("\n");
};

const compileImage = (slice) => {
  return Gen.replaceAllKeys(
    {
      src: _get(slice, "primary.image.url", ""),
      alt: _get(slice, "primary.image.alt", ""),
    },
    pageImageTemplate
  );
};

const compileSubheading = (slice) => {
  return Gen.replaceAllKeys(
    {
      subheading: _get(slice, "primary.subheading", ""),
    },
    pageSubheadingTemplate
  );
};

const compileSinglePage = async (page, pageMeta) => {
  const data = _get(page, "node", {});

  // primary data needed for meta
  const slug = _get(data, "_meta.uid", "");
  Log.subtitle(`Generating ${slug}`);
  const title = _get(data, "heading", "");
  const description = _get(data, "description", "");
  const headerImageURL = _get(data, "header_image.url", "");

  const metaHTML = Gen.replaceAllKeys(
    {
      ...pageMeta,
      title,
      "share-image-url": headerImageURL,
      description,
    },
    metaTemplate,
    true
  );

  // primary data
  const headerImageAlt = _get(data, "header_image.url", "");

  // Header Links
  const headerLinks = _get(data, "links", []);
  let linksHTML = "";
  headerLinks.forEach((link) => {
    linksHTML += Gen.replaceAllKeys(
      {
        url: _get(link, "link.url", ""),
        name: _get(link, "name", ""),
      },
      pageHeaderLinkTemplate
    );
  });
  const headingLinkListHTML = Gen.replaceAllKeys(
    {
      links: linksHTML,
    },
    pageHeaderLinkListTemplate
  );

  // Header
  const headerHTML = Gen.replaceAllKeys(
    {
      title,
      links: headingLinkListHTML,
      "header-image-url": headerImageURL,
      "header-image-alt": headerImageAlt,
    },
    pageHeaderTemplate
  );

  const slices = _get(data, "body", []) ?? [];
  const slicesHTML = slices
    .map((slice) => {
      const type = _get(slice, "__typename", null);
      switch (type) {
        case "PageBodyText_block":
          return compileParagraph(slice);
        case "PageBodyImage":
          return compileImage(slice);
        case "PageBodySubheading":
          return compileSubheading(slice);
        default:
          Log.fail(`slice type "${type}" not handled!`);
          return "";
      }
    })
    .join("\n");

  // Project Page HTML
  const projectHTML = Gen.replaceAllKeys(
    {
      meta: metaHTML,
      title,
      header: headerHTML,
      slices: slicesHTML,
    },
    pageTemplate
  );

  Gen.testForMissingKeys(projectHTML, `${slug}/index.html`);

  // // write the index file
  // Log.subtitle("Writing index html file");
  // await Gen.writeFile("index", indexHTML);
  await Gen.writePage(slug, projectHTML);
  Log.pass(`${slug} created`);
};

module.exports = compilePages;
