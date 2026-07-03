import eslintReact from "@eslint-react/eslint-plugin";
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importPlugin from "eslint-plugin-import-x";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintReact.configs["recommended-typescript"],
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
      "react-refresh": reactRefresh,
    },
    rules: {
      "comma-dangle": ["error", "always-multiline"],
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-duplicate-imports": ["error", { includeExports: true }],
      "import-x/no-relative-packages": "error",

      "@eslint-react/set-state-in-effect": "off",

      "@typescript-eslint/no-restricted-imports": [
        "warn",
        {
          paths: [
            {
              name: "react-redux",
              importNames: ["useSelector", "useDispatch"],
              message:
                "Use typed hooks `useAppDispatch` and `useAppSelector` instead.",
            },
            {
              name: "react-router",
              importNames: ["useNavigate", "Link", "Navigate"],
              message: "Use `AppLink`, `AppNavigate` or `useAppNavigate`.",
            },
          ],
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
      "import-x/resolver-next": [createTypeScriptImportResolver()],
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
