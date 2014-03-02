var createRepo = require('./repo.js');
var publisher = require('./publisher.js');
var gitTree = require('git-tree');
//   platform.configs
//   platform.repos
//   platform.getRootHash() -> rootHash
//   platform.setRootHash(rootHash) ->
//   platform.saveConfig() ->
//   platform.createRepo(config) -> repo

module.exports = createSite;


function createSite(config, callback) {
  config.ref = config.ref || "refs/heads/master";
  var repo = createRepo(config);
  var rootHash, last, loading;
  last = Date.now();
  repo.readRef(config.ref, function (err, hash) {
    if (!hash) return callback(err || new Error("No master branch"));
    rootHash = hash;
    var fs = gitTree({
      configs: {"": config},
      repos: {"": repo},
      getRootHash: getRootHash,
      setRootHash: setRootHash,
      saveConfig: saveConfig,
      createRepo: createRepo
    });
    callback(null, publisher(fs.readPath, config));
  });


  function getRootHash() {
    var now = Date.now();
    if (now - last < 1000) return rootHash;
    if (loading) return;
    loading = true;
    last = now;
    process.nextTick(loadRoot);
    return rootHash;
  }

  function loadRoot() {
    repo.readRef(config.ref, function (err, hash) {
      loading = false;
      if (err) {
        console.error(err.stack);
        return;
      }
      if (hash) rootHash = hash;
    });
  }

  function setRootHash() {
    throw new Error("Updating root not allowed");
  }

  function saveConfig() {
    // Nothing to do
  }

}
