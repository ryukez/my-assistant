module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: ["build", "jest.config.js"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "jest", "unused-imports", "import"],
  rules: {
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "jest/consistent-test-it": ["error", { fn: "it" }],
    "unused-imports/no-unused-imports": "error",
  },
};
