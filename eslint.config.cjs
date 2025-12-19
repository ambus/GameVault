const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const angularEslint = require("@angular-eslint/eslint-plugin");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{}, globalIgnores([
    "**/dist",
    "**/node_modules",
    "**/*.spec.ts",
    "**/cypress/**",
    "**/functions/**"
]), {
    files: ["**/*.ts"],
    ignores: ["**/*.spec.ts", "**/cypress/**", "**/functions/**"],

    extends: compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
    ),

    languageOptions: {
        parser: tsParser,
        sourceType: "module",

        parserOptions: {
            project: ["./tsconfig.json", "./tsconfig.app.json"],
            tsconfigRootDir: __dirname,
        },
    },

    plugins: {
        "@typescript-eslint": typescriptEslint,
        "@angular-eslint": angularEslint,
    },

    rules: {
        "@angular-eslint/component-class-suffix": ["error", {
            suffixes: ["Component"],
        }],
    },
}, {
    files: ["**/*.html"],
    extends: compat.extends("plugin:@angular-eslint/template/recommended"),
    rules: {},
}]);


