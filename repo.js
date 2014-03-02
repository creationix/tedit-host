var pathJoin = require('path').join;
var githubToken = process.env.GITHUB_TOKEN;
var nodeCache = require('js-git/lib/node-fs-cache')(pathJoin(__dirname, "cache"));

module.exports = createRepo;
// config.name  - githubName like `creationix/tedit-host`
// config.token - github auth token
function createRepo(config) {
  var repo = {};
  var token = config.token || githubToken;
  if (!config.github) throw new Error("Only github mount repos allowed");
  var githubName = getGithubName(config.url);
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

function getGithubName(url) {
  var match = url.match(/github.com[:\/](.*?)(?:\.git)?$/);
  if (!match) throw new Error("Url is not github repo: " + url);
  return match[1];
}
