require('./color.js'); // Make console.log colorful
var urlParse = require('url').parse;
var http = require('http');
var getSite = require('./config.js');
var modes = require('js-git/lib/modes');
var pathJoin = require('pathjoin');
var getMime = require('simple-mime')('text/plain');

var server = http.createServer(function (req, res) {

  // Ensure the request is either HEAD or GET by rejecting everything else
  var head = req.method === "HEAD";
  if (!head && req.method !== "GET") {
    res.statisCode = 405;
    res.setHeader("Allow", "HEAD,GET");
    return res.end();
  }

  var host = req.headers.host.split(":")[0];
  getSite(host, function (err, servePath) {
    if (err) return error(err);
    if (!servePath) {
      res.statusCode = 404;
      return res.end();
    }
    var settings = servePath.config;
    console.log(host, req.method, req.url);
    var pathname = urlParse(req.url).pathname;
    var path = pathname.substring(1);
    if (settings.source) path = pathJoin(settings.source, path);
    var etag = req.headers['if-none-match'];
    serve();

    function serve() {
      servePath(path, function (err, result) {
        try { onServe(err, result); }
        catch (err) { error(err); }
      });
    }

    function onServe(err, result) {
      if (err) return error(err);

      if (!(result && result.hash)) {
        res.statusCode = 404;
        return res.end(pathname + " not found");
      }

      res.setHeader("Etag", result.hash);

      if (result.hash && result.hash === etag) {
        // etag matches, no change
        res.statusCode = 304;
        return res.end();
      }


      if (result.mode === modes.tree) {
        // Tell the browser to redirect if they forgot the trailing slash on a tree.
        if (pathname[pathname.length - 1] !== "/") {
          res.statusCode = 301;
          res.setHeader("Location", pathname + "/");
          return res.end();
        }
        return result.fetch(function (err, tree) {
          if (err) return error(err);
          // Do an internal redirect if an index.html exists
          if (tree["index.html"]) {
            path += "/index.html";
            return serve();
          }
          // Otherwise send the raw JSON
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          return res.end(JSON.stringify(tree) + "\n");
        });
      }

      result.fetch(function (err, body) {
        if (err) return error(err);
        res.setHeader("Content-Type", result.mime || getMime(path));
        res.end(body);
      });

    }
  });

  function error(err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end(err.stack);
  }
});

server.listen(process.env.PORT || 8080, function () {
  console.log("Tedit Host Server at http://localhost:%s/", server.address().port);
});
