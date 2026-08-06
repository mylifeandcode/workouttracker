// @ts-check
const eslint = require("@eslint/js");
const { defineConfig, globalIgnores } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  globalIgnores(["src/app/api/**"]),
  {
    files: ["**/*.ts"],
    //The Playwright E2E suite is plain Node/TypeScript, not Angular; it gets its own block below.
    ignores: ["e2e/**/*.ts", "playwright.config.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "wt",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "wt",
          style: "kebab-case",
        },
      ],
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/consistent-type-assertions": "off",
      "@typescript-eslint/no-inferrable-types": [
        "off",
        null
      ],
      "@typescript-eslint/prefer-for-of": "off", // Could not always be used. Weird rule. https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-for-of.md 
    },
  },
  {
    files: ["e2e/**/*.ts", "playwright.config.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
    ],
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/consistent-type-assertions": "off",
      "@typescript-eslint/no-inferrable-types": [
        "off",
        null
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/eqeqeq": [
        "off",
        null
      ]
    },
  }
]);
