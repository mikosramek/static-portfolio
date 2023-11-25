const base = require("./base");
const home = require("./home");

const basePages = `
{
    ${home}
}
`;

const firstEntries = `
{
    allPages (sortBy:meta_firstPublicationDate_ASC) {
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
    allPages (after: "${lastId}", first: 20, sortBy:meta_firstPublicationDate_ASC) {
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
