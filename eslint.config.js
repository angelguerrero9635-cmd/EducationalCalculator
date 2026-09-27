// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    // .review/ holds reviewers' scratch scripts (not committed).
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'coverage/*', '.review/*'],
  },
]);
