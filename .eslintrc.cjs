module.exports = {
  env: {
    node: true,
    browser: true,
    es2024: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:astro/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    semi: ["error", "always"],
    quotes: ["error", "double", { "allowTemplateLiterals": true }],
    "@typescript-eslint/triple-slash-reference": "off",
  },
  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
      rules: {},
    },
    {
      // Los <script> de los .astro llevan TypeScript (genéricos, `!`, tipos en
      // los parámetros). eslint-plugin-astro los extrae como ficheros virtuales
      // .js, así que el override de arriba no los alcanza: sin esto se parsean
      // como JS a secas y dan "Parsing error" y `'string' is not defined`.
      files: ["**/*.astro/*.js", "*.astro/*.js"],
      parser: "@typescript-eslint/parser",
      rules: {
        "no-undef": "off", // los tipos de TS no son variables
      },
      // Límite conocido del extractor: dentro de un <script> de .astro, una
      // llamada con genérico cuyos argumentos ocupan VARIAS líneas
      // (`querySelectorAll<HTMLElement>(\n ... \n)`) da "Parsing error:
      // Expression expected". Deja el genérico y sus argumentos en una línea.
    },
  ],
};
