// Lighthouse CI: every built page, default mobile emulation and throttling.
const { readdirSync } = require("node:fs");
const { join, relative } = require("node:path");

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(path);
    return e.name.endsWith(".html") && e.name !== "404.html" ? [path] : [];
  });
}

// LHCI's static server has no clean URLs, so point at the .html files directly.
const urls = htmlFiles("dist").map((file) => `http://localhost/${relative("dist", file)}`);

module.exports = {
  ci: {
    collect: {
      staticDistDir: "./dist",
      url: urls,
      numberOfRuns: 1,
      settings: { chromePath: process.env.CHROME_PATH },
    },
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:performance": ["error", { minScore: 0.95 }],
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci" },
  },
};
