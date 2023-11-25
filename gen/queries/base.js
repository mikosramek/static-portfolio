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
      description
      heading
      header_image
      links {
        name
        link {
          ... on _ExternalLink {
            url
          }
        }
      }
  }
}
`;
