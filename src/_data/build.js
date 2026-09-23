// A fresh id per build, appended to the stylesheet and script URLs as ?v=<id>. Caddy sends
// no Cache-Control, so browsers kept the old site.css across deploys and drew new pages with
// old styles (seen live on 2026-09-23 after v4 and v5 shipped together). A new query string
// per build forces a fresh download without any server configuration.
module.exports = function () {
  return { id: Date.now().toString(36) };
};
