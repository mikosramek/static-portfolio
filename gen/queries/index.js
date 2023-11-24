const base = require("./base");
const home = require("./home");

const basePages = `
{
    ${home}
}
`;

const firstEntries = `
{
    <page-name> (sortBy:meta_firstPublicationDate_ASC) {
        totalCount
        pageInfo {
            hasNextPage
        }
        ${base}
    }
}
`;

const entries = (lastId) => `
{
    <page-name> (after: "${lastId}", first: 20, sortBy:meta_firstPublicationDate_ASC) {
        totalCount
        pageInfo {
            hasNextPage
        }
        ${base}
    }
}
`;

module.exports = {
  basePages,
  firstEntries,
  entries,
};
