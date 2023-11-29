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
      body {
        __typename
        ... on PageBodyText_block {
          primary {
            copy
          }
        }
        ... on PageBodyImage {
          primary {
            image
          } 
        }
        ... on PageBodySubheading {
          primary {
            subheading
          }
        }
      }
  }
}
`;
