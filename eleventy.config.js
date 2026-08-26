// Eleventy config. Input: src/, output: _site/.
// PATH_PREFIX is set by the GitHub Pages workflow (project-site subpath); Railway serves from "/".
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/uploads");

  return {
    dir: { input: "src", output: "_site", includes: "_includes" },
    pathPrefix: process.env.PATH_PREFIX || "/",
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
