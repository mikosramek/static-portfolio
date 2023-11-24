module.exports = `
edges {
  cursor
  node {
      _meta {
          id
          uid
          lastPublicationDate
          firstPublicationDate
      }
      body {
        __typename
        ... on <typename> {
          primary {
          }
          fields {
          }
        }
      }
  }
}
`;
