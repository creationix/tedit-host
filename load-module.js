var vm = require('vm');

// Compile cjs formatted code in a sandbox and return
module.exports = function (code, filename) {
  var exports = {};
  var module = { exports: exports };
  vm.runInNewContext(code, {
    module: module,
    exports: exports,
    require: require
  }, filename);
  return module.exports;
};
