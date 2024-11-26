import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.react,
  eslintConfigPrettier,
  prettierPlugin,
  {
    ignores: ["build/"],
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        process: true,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
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
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    ignores: ["src/"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
