/* eslint-env node */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/recommended",
    "plugin:import/react",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  globals: {
    process: true,
  },
  plugins: ["react", "react-hooks"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "comma-dangle": ["error", "always-multiline"],
    "no-empty": ["error", { allowEmptyCatch: true }],
    "no-duplicate-imports": ["error", { includeExports: true }],
    "import/no-relative-packages": "error",
  },
  settings: {
    "react": {
      version: "detect",
    },
    "import/resolver": {
      alias: {
        map: [["~", "./src"]],
        extensions: [".js", ".jsx"],
      },
    },
  },
  overrides: [
    {
      files: ["scripts/*.js"],
      env: {
        node: true,
      },
    },
  ],
};
