import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import astro from "eslint-plugin-astro";
import perfectionist from "eslint-plugin-perfectionist";
import { configs as regexp } from "eslint-plugin-regexp";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import { configs as ts } from "typescript-eslint";

export default defineConfig([
  globalIgnores([".astro/", "dist/"]),
  js.configs.recommended,
  ts.strictTypeChecked,
  ts.stylisticTypeChecked,
  unicorn.configs.recommended,
  regexp["flat/recommended"],
  comments.recommended,
  astro.configs.recommended,
  prettier,
  {
    languageOptions: {
      globals: { ...globals.builtin, ...globals.browser },
      parserOptions: { projectService: true, extraFileExtensions: [".astro"] },
    },
    linterOptions: { reportUnusedDisableDirectives: "error", reportUnusedInlineConfigs: "error" },
    plugins: { perfectionist },
    rules: {
      "@eslint-community/eslint-comments/no-unused-disable": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "no-console": "warn",
      "no-shadow": "off", // @typescript-eslint/no-shadow
      "perfectionist/sort-imports": [
        "error",
        {
          type: "natural",
          newlinesBetween: 1,
          groups: ["side-effect", "astro", "three", ["builtin", "external"], ["parent", "sibling", "index"], "type"],
          customGroups: [
            { groupName: "astro", elementNamePattern: "^astro(:.+)?$|^astro/.+" },
            { groupName: "three", elementNamePattern: "^three(/.+)?$" },
          ],
        },
      ],
      "perfectionist/sort-named-imports": ["error", { type: "natural", groups: ["import", "type-import"] }],
      "perfectionist/sort-named-exports": ["error", { type: "natural", groups: ["export", "type-export"] }],
      "perfectionist/sort-object-types": ["error", { type: "natural", partitionByNewLine: true }],
      "perfectionist/sort-union-types": ["error", { type: "natural" }],
      "unicorn/filename-case": "off", // use default export name
      "unicorn/no-null": "off", // part of multiple apis
      "unicorn/name-replacements": ["error", { allowList: { Props: true } }], // astro convention
      "unicorn/no-useless-undefined": ["error", { checkArrowFunctionBody: false }],
      "unicorn/number-literal-case": "off", // incompatible with prettier
      "unicorn/switch-case-braces": ["error", "avoid"],
    },
  },
  {
    files: ["**/*.astro"],
    languageOptions: { parserOptions: { projectService: false, project: true } },
    rules: { "@typescript-eslint/no-unsafe-return": "off" }, // astro jsx has no element type
  },
  { files: ["**/*.mjs"], ...ts.disableTypeChecked, languageOptions: { globals: globals.node } },
  { files: ["**/*.astro/*.ts"], ...ts.disableTypeChecked },
]);
