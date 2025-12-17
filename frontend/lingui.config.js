/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ["sl", "en"],
  // Strings in the source code are currently written in Slovenian
  sourceLocale: "sl",
  catalogs: [
    {
      // Compiled catalogs will live under: frontend/locales/{locale}
      path: "locales/{locale}",
      // Scan all source files under src/ for messages
      include: ["src"],
    },
  ],
  format: "po",
};
