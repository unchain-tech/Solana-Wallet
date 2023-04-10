module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["standard", "prettier", "plugin:react/recommended"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "no-lone-blocks": ["off"],
    "no-unused-vars": ["warn"],
    "react/prop-types": ["off"],
    "react/jsx-uses-react": ["off"],
    "react/react-in-jsx-scope": ["off"],
  },
  settings: {
    react: {
      version: "18.0.0",
    },
  },
};
