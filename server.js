var accessToken = process.env.TOKEN;
var jsGithub = require('js-git/mixins/github-db');
var http = require('http');

var repo = mountGithub("creationix/exploder");

console.log(repo);
repo.readRef("refs/heads/master", function (err, ref) {
  if (err) throw err;
  console.log("MASTER", ref);
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
  // require('js-git/mixins/add-cache')(repo, require('js-git/mixins/level-db'));

  // Cache everything except blobs over 100 bytes in memory.
  require('js-git/mixins/mem-cache')(repo);

  // // Combine concurrent read requests for the same hash
  require('js-git/mixins/read-combiner')(repo);
  return repo;
}
