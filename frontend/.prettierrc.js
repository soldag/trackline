/* eslint-env node */
const { readdirSync } = require("fs");

const JS_EXT_REGEX = /\.jsx?$/;

const {
  compilerOptions: { baseUrl },
} = require("./jsconfig.json");
const baseUrlModules = readdirSync(`${__dirname}/${baseUrl}`, {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory() || JS_EXT_REGEX.test(entry.name))
  .map((entry) => entry.name.replace(JS_EXT_REGEX, ""));

const baseUrlModulesRegex = `^(${baseUrlModules.join("|")})`;

module.exports = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  quoteProps: "consistent",
  jsxSingleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "^@mui/(.*)$",
    baseUrlModulesRegex,
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
