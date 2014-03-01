var githubToken = process.env.GITHUB_TOKEN;
var pathJoin = require('path').join;
var nodeCache = require('js-git/lib/node-fs-cache')(pathJoin(__dirname, "cache"));
require('./color.js');


var http = require('http');
var modes = require('js-git/lib/modes');

var configRepo = mountGithub("creationix/tedit-sites");

configRepo.logWalk("HEAD", function (err, log) {
  if (err) throw err;

  log.read(onCommit);
  var treeStream;

  function onCommit(err, item) {
    if (err) throw err;
    console.log(item);
    if (item) configRepo.treeWalk(item.tree, onTreeStream);
  }

  function onTreeStream(err, stream) {
    if (err) throw err;
    treeStream = stream;
    treeStream.read(onItem);
  }

  function onItem(err, item) {
    if (err) throw err;
    if (item) {
      console.log(item.hash, modes.toType(item.mode), item.path);
      treeStream.read(onItem);
    }
    else log.read(onCommit);
  }
});


// Create repos from githubName like `creationix/tedit-host`
function mountGithub(githubName) {
  var repo = {};
  if (!githubToken) throw new Error("Missing GITHUB_TOKEN access token in env");
  require('js-git/mixins/github-db')(repo, githubName, githubToken);
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
