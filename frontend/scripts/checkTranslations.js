const fs = require("fs");
const path = require("path");
const globSync = require("glob").sync;
require("colors");

const ROOT_DIR = path.resolve(__dirname, "..");
const TRANSLATIONS_DIR = path.resolve(ROOT_DIR, "src/translations");
const FILE_GLOB = path.resolve(TRANSLATIONS_DIR, "*.json");
const DEFAULT_LOCALE_FILE_PATH = path.resolve(TRANSLATIONS_DIR, "en.json");

const readMessages = (filename) =>
  fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename), "utf-8") : {};

let hasErrors = false;
const defaultMessageIds = Object.keys(readMessages(DEFAULT_LOCALE_FILE_PATH));

globSync(FILE_GLOB).forEach((filePath) => {
  if (filePath === DEFAULT_LOCALE_FILE_PATH) return;

  const messages = readMessages(filePath);
  const messageIds = Object.keys(messages);
  const missingIds = defaultMessageIds.filter((k) => !messages[k]);
  const unusedKeys = messageIds.filter((k) => !defaultMessageIds.includes(k));
  if (missingIds.length + unusedKeys.length > 0) {
    hasErrors = true;

    const relativeFilePath = path.relative(ROOT_DIR, filePath);
    console.error(relativeFilePath.underline);
    missingIds
      .sort()
      .forEach((id) => console.log(`${"missing-id".red}  ${id}`));
    unusedKeys
      .sort()
      .forEach((id) => console.log(`${"unused-id".red}   ${id}`));
    console.error();
  }
});

process.exit(hasErrors ? 1 : 0);
