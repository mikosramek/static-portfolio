module.exports = `
  allHomes {
    edges {
      node {
        description
        title
        subtitle
        hero_image
        headshot
        body {
          __typename
          ... on HomeBodyZone {
            primary {
              name
            }
            fields {
              page_link {
                ... on Page {
                  description
                  header_image
                  heading
                  _meta {
                    uid
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
