class ConfigHolder {
  constructor() {
    this.DECLARE_MISSING_KEYS =
      process.env.DECLARE_MISSING_KEYS === "true" ?? false;
    this.PRISMIC_REPO = process.env.PRISMIC_REPO ?? "";
    this.PRISMIC_ACCESS_TOKEN = process.env.PRISMIC_ACCESS_TOKEN ?? "";
  }
}

module.exports = new ConfigHolder();
