var express = require('express');
var fs = require('fs');
var path = require('path');

var portret = {};
portret.collectionPath = "./../collections/";
portret.fileTypes = [".jpg", ".jpeg", ".png", ".gif"];

var app = express();

app.get('/collections', function (req, res) {
   res.end(JSON.stringify(portret.getCollections()));
});

app.get('/collection/:name', function (req, res) {
    res.end(JSON.stringify(portret.getPics(req.params.name)));
});

var server = app.listen(8081, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log("Portret API listening at http://%s:%s", host, port)
});

/**
 * Return a list of known collections.
 * @return {Array}
 */
portret.getCollections = function () {
    var result = [];
    var files = fs.readdirSync(portret.collectionPath);
    for (var f in files) {
        var curFile =  path.join(portret.collectionPath, files[f]);
        if (fs.statSync(curFile).isDirectory()) {
            var collection = {};
            collection.name = files[f];
            collection.count = portret.getPics(collection.name).count;
            result.push(collection);
        }
    }
    return result;
};

/**
 * Return the list of pics in a collection.
 *
 * @param collection
 * @return {Array}
 */
portret.getPics = function (collection) {
    var result = {};
    result.name = collection;
    result.pics = [];
    function walkDir(curPath) {
        var files = fs.readdirSync(curPath);
        for (var f in files) {
            var curFile = path.join(curPath, files[f]);
            if (fs.statSync(curFile).isFile() && portret.fileTypes.indexOf(path.extname(curFile).toLowerCase()) != -1) {
                result.pics.push(files[f]);
            } else if (fs.statSync(curFile).isDirectory()) {
                walkDir(curFile);
            }
        }
    }
    walkDir(path.join(portret.collectionPath, collection));
    result.count = result.pics.length;
    return result;
};
