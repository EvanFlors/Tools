import importPlugin from "eslint-plugin-import";

export default [
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/extensions": [
        "error",
        "always",
        {
          js: "always",
        },
      ],
    },
  },
];