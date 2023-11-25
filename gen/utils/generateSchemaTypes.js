const { MNPG } = require("@mikosramek/mnpg");
require("dotenv").config();

const Gen = require("./Gen");

const prismicName = process.env.PRISMIC_REPO ?? "";
const secret = process.env.PRISMIC_ACCESS_TOKEN ?? "";

const client = new MNPG(prismicName, secret);

const getSchema = async () => {
  await client.createFragments(Gen.schemaPath);
};

getSchema();
