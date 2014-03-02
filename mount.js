var pathJoin = require('path').join;
var githubToken = process.env.GITHUB_TOKEN;
var nodeCache = require('js-git/lib/node-fs-cache')(pathJoin(__dirname, "cache"));
module.exports = mountGithub;

// Create repos from githubName like `creationix/tedit-host`
function mountGithub(githubName, token) {
  var repo = {};
  token = token || githubToken;
  if (!token) throw new Error("Missing GITHUB_TOKEN access token in env");
  require('js-git/mixins/github-db')(repo, githubName, token);
  // Github has this built-in, but it's currently very buggy
  require('js-git/mixins/create-tree')(repo);

  // Add walker helpers
  require('js-git/mixins/walkers')(repo);

  // // Cache github objects locally in indexeddb
  require('js-git/mixins/add-cache')(repo, nodeCache);

  // Cache everything except blobs over 100 bytes in memory.
  require('js-git/mixins/mem-cache')(repo);

  // // Combine concurrent read requests for the same hash
  require('js-git/mixins/read-combiner')(repo);
  return repo;
}
