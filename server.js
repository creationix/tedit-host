require('./color.js'); // Make console.log colorful
var http = require('http');
var getSite = require('./config.js');

var server = http.createServer(function (req, res) {
  var host = req.headers.host.split(":")[0];
  getSite(host, function (err, config) {
    if (err) throw err;
    console.log(host, req.method, req.url, config);
    res.end(JSON.stringify(config));
  });
});

server.listen(8080, function () {
  console.log("Tedit Host Server at http://localhost:8080/");
});
