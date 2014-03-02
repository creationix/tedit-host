var binary = require('bodec');
var jonParse = require('jon-parse');
var modes = require('js-git/lib/modes');

var createRepo = require('./repo.js');
var createSite = require('./site.js');

var configRepo = createRepo({
  url: "git@github.com:creationix/tedit-sites.git",
  github: true
});

module.exports = getSite;

var headHash, last;
var sites = {};
function getSite(domain, callback) {
  var blobHash, config;
  var now = Date.now();
  if (headHash && now - last < 10000) return onHash(null, headHash);
  last = now;
  return configRepo.readRef("refs/heads/master", onHash);

  function onHash(err, hash) {
    if (!hash) return callback(err || new Error("Missing master branch"));
    headHash = hash;
    configRepo.loadAs("commit", hash, onCommit);
  }

  function onCommit(err, commit) {
    if (!commit) return callback(err || new Error("Missing commit " + headHash));
    configRepo.loadAs("tree", commit.tree, onTree);
  }

  function onTree(err, tree) {
    if (!tree) return callback(err || new Error("Missing tree"));
    var entry = tree[domain + ".rule"];
    if (!entry) return callback();
    if (entry.mode !== modes.exec) {
      return callback(new Error(domain + " is disabled."));
    }
    blobHash = entry.hash;
    var site = sites[domain];
    if (site && blobHash === site.hash) {
      return callback(null, site);
    }
    if (entry) configRepo.loadAs("blob", entry.hash, onBlob);
  }

  function onBlob(err, blob) {
    if (!blob) return callback(err || new Error("Missing blob"));
    try {
      var jon = binary.toUnicode(blob);
      config = jonParse(jon);
    }
    catch (err) {
      return callback(err);
    }
    createSite(config, onSite);
  }

  function onSite(err, site) {
    if (err) return callback(err);
    sites[domain] = site;
    site.hash = blobHash;
    site.config = config;
    callback(null, site);
  }

}
