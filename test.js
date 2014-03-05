var repo = require('./repo')({
  url: "git@github.com:creationix/exploder.git",
  github: true
});
require('js-git/mixins/packops')(repo);

console.log(repo);