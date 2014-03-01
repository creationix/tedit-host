var accessToken = process.env.TOKEN;
var pathJoin = require('path').join;
var nodeCache = require('js-git/lib/node-fs-cache')(pathJoin(__dirname, "cache"));
var http = require('http');

// Make console.log colorized
{
  var inspect = require('util').inspect;
  var realLog = console.log;
  console.log = function () {
    var args = Array.prototype.slice.call(arguments).map(function (item, i) {
      if (!i && typeof item === 'string') return item;
      return inspect(item, {colors:true});
    });
    realLog.apply(null, args);
  };
}

var repo = mountGithub("creationix/exploder");

repo.readRef("refs/heads/master", function (err, ref) {
  if (err) throw err;
  repo.loadAs("commit", ref, function (err, commit) {
    if (err) throw err;
    console.log("COMMIT", commit);
  });
});

// Create repos from githubName like `creationix/tedit-host`
function mountGithub(githubName) {
  var repo = {};
  var githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) throw new Error("Missing GITHUB_TOKEN access token in env");
  require('js-git/mixins/github-db')(repo, githubName, githubToken);
  // Github has this built-in, but it's currently very buggy
  require('js-git/mixins/create-tree')(repo);
  // // Cache github objects locally in indexeddb
  require('js-git/mixins/add-cache')(repo, nodeCache);

  // Cache everything except blobs over 100 bytes in memory.
  require('js-git/mixins/mem-cache')(repo);

  // // Combine concurrent read requests for the same hash
  require('js-git/mixins/read-combiner')(repo);
  return repo;
}
