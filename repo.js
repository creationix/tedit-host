var pathJoin = require('path').join;
var githubToken = process.env.GITHUB_TOKEN;
var nodeCache = {
  rootPath: pathJoin(__dirname, "cache")
};
var fs = require('fs');
require('js-git/mixins/fs-db')(nodeCache, {
  readFile: fs.readFile,
  writeFile: fs.writeFile
});

module.exports = createRepo;
// config.name  - githubName like `creationix/tedit-host`
// config.token - github auth token
function createRepo(config) {
  var repo = {};
  if (config.github) {
    var token = config.token || githubToken;
    var githubName = getGithubName(config.url);
    if (!token) throw new Error("Missing GITHUB_TOKEN access token in env");
    require('js-git/mixins/github-db')(repo, githubName, token);
  }
  else {
    require('js-git/mixins/mem-db')(repo);
  }

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
