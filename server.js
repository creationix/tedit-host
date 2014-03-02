require('./color.js'); // Make console.log colorful

var mountRepo = require('./mount.js');
var http = require('http');



var configRepo = mountRepo("creationix/tedit-sites");

var server = http.createServer(function (req, res) {
  console.log(req);
});

server.listen(8080, function () {
  console.log("Tedit Host Server at http://localhost:8080/");
});