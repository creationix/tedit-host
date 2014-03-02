var mountRepo = require('./mount.js');
module.exports = createSite;

function createSite(config) {
  config.repo = mountRepo(config.repoName, config.token);
  return config;
}