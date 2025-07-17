import jsGlobals from "globals";
import pluginJs from "@eslint/js";

const myGlobals = {
  process: 'readonly',
  jest: 'readonly',
  readline: 'readonly'
};

const jest = {
  describe: 'readonly',
  beforeEach: 'readonly',
  it: 'readonly',
  expect: 'readonly'
}

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"], 
    languageOptions: {sourceType: "commonjs"}},
  {
    languageOptions: { 
      globals: {
        ...myGlobals,
        ...jest,
        ...jsGlobals.browser 
      }
    }
  },
  pluginJs.configs.recommended,
];