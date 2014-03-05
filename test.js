require('./color');
var repo = require('./repo')({});
require('js-git/mixins/packops')(repo);

console.log(repo);
var file = require('fs').createReadStream("test.pack");
var packStream = nodeToSimple(file);

repo.unpack(packStream, {}, function (err, hashes) {
  if (err) throw err;
  console.log(hashes);
});

function nodeToSimple(stream) {
  var cb;
  var readable = false;
  var done = false;
  stream.on('readable', function() {
    readable = true;
    if (cb) {
      var callback = cb;
      cb = null;
      readChunk
      (callback);
    }
  });
  stream.on("end", function () {
    if (cb) {
      done = true;
      var callback = cb;
      cb = null;
      readChunk
      (callback);
    }
  });

  return { read: readChunk };

  function readChunk(callback) {
    if (done) return callback();
    if (!readable) {
      if (cb) throw new Error("Only one read at a time");
      cb = callback;
      return;
    }
    var data = stream.read();
    if (data === null) {
      readable = false;
      return readChunk(callback);
    }
    callback(null, data);
  }
}