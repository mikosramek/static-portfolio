# mnpg Template

This is a boilerplate template for my style of SSG, it uses my `@mikosramek/mnpg` package and contains helper classes / functionality. This repo is a jumping off point for my own creation, but also serves as documentation on how to use my package.

## Usage

- Create a prismic.io repo
- Get repo name + access key and put them into `.env`
- Do `npm run generate-schema` to populate the schema file
- Update `/queries` files to handle your graphql data
  - Replace values within `<xxxxx>` as needed
  - Use `https://<repo-name>.prismic.io/graphql` to help generate queries for your data
- Add in your generation logic within `gen/generate.js`

## Gen

Gen is just a utility class that helps create / load files. It has prepopulated folders and functions, but essentially just loads/saves text into `html` files.

| function         | info                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `copyOverStatic` | will copy the defined `static` folder into the defined `build` folder                                                         |
| `replaceAllKeys` | can be used to replace keys in your html templates with values that come from Prismic. Keys are formated to be `%<key-name>%` |
| `writeFile`      | will write a file to the base `build` folder, and assumes it's an html file, but the third argument can override file type    |
| `writePage`      | will create a subfolder using a name, so you can easily create a `website.com/page-slug/index.html` file                      |
