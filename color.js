// Make console.log colorized
var inspect = require('util').inspect;
var realLog = console.log;
console.log = function () {
  var args = Array.prototype.slice.call(arguments).map(function (item, i) {
    if (!i && typeof item === 'string') return item;
    return inspect(item, {colors:true});
  });
  realLog.apply(null, args);
};
