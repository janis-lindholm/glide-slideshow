var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic(__dirname + "/../..")).listen(8080, function() {
    console.log("Web server listening at http://127.0.0.1:8080");
});
