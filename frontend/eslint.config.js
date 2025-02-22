import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
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
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
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

      "@typescript-eslint/no-restricted-imports": [
        "warn",
        {
          name: "react-redux",
          importNames: ["useSelector", "useDispatch"],
          message:
            "Use typed hooks `useAppDispatch` and `useAppSelector` instead.",
        },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          filter: { match: false, regex: "_" },
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
        },
        {
          selector: ["import", "parameter", "variable"],
          format: ["camelCase", "PascalCase"],
          filter: { match: false, regex: "_" },
        },
        {
          selector: "variable",
          modifiers: ["const", "exported"],
          format: ["PascalCase", "UPPER_CASE"],
        },
        {
          selector: ["typeLike", "enumMember"],
          format: ["PascalCase"],
        },
        {
          selector: ["property"],
          format: null,
        },
      ],
    },
    settings: {
      "react": {
        version: "detect",
      },
      "import/resolver": {
        typescript: true,
      },
      "import/ignore": ["qr-scanner"],
    },
  },
  {
    files: ["**/*.{ts,js,mjs,cjs}"],
    ignores: ["src/"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
);
