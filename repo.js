var pathJoin = require('path').join;
var githubToken = process.env.GITHUB_TOKEN;
var nodeCache = {
  rootPath: pathJoin(__dirname, "cache")
};
var fs = require('fs');
var dirname = require('path').dirname;
require('js-git/mixins/fs-db')(nodeCache, {
  readFile: function (path, callback) {
    fs.readFile(path, function (err, buffer) {
      if (err) {
        if (err.code === "ENOENT") return callback();
        return callback(err);
      }
      callback(null, buffer);
    });
  },
  writeFile: function (path, buffer, callback) {
    mkdirp(dirname(path), function (err) {
      if (err) return callback(err);
      fs.writeFile(path, buffer, callback);
    });
  },
  readDir: function (path, callback) {
    fs.readdir(path, function (err, results) {
      if (err) {
        if (err.code === "ENOENT") return callback();
        return callback(err);
      }
      return callback(null, results);
    });
  }
});

function mkdirp(path, callback) {
  fs.mkdir(path, function (err) {
    if (err) {
      if (err.code === "ENOENT") return mkdirp(dirname(path), function (err) {
        if (err) return callback(err);
        fs.mkdir(path, callback);
      });
      if (err.code === "EEXIST") return callback();
      return callback(err);
    }
    callback();
  });
}


module.exports = createRepo;
// config.name  - githubName like `creationix/tedit-host`
// config.token - github auth token
function createRepo(config) {
  var repo = {};
  if (config.github) {
    var token = config.token || githubToken;
    var githubName = getGithubName(config.url);
    if (!token) throw new Error("Missing GITHUB_TOKEN access token in env");
    require('js-github/mixins/github-db')(repo, githubName, token);
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
