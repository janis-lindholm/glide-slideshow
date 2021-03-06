var express = require('express');
var fs = require('fs');
var path = require('path');

var portret = {};
portret.collectionPath = "./collections/";
portret.fileTypes = [".jpg", ".jpeg", ".png", ".gif"];

var app = express();

// configure CORS
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/collections', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(portret.getCollections()));
});

app.get('/collection/:name', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(portret.getPics(req.params.name)));
});

var server = app.listen(8081, function () {
   var host = server.address().address;
   var port = server.address().port;
   host = (host == "::") ? "127.0.0.1" : host;
   console.log("Portret REST API listening at http://%s:%s", host, port);
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
    var result = {},
        numberedFileNames = true;
    result.name = collection;
    result.pics = [];
    function walkDir(curPath) {
        var files = fs.readdirSync(curPath);
        for (var f in files) {
            var curFile = path.join(curPath, files[f]);
            if (fs.statSync(curFile).isFile() && portret.fileTypes.indexOf(path.extname(curFile).toLowerCase()) != -1) {
                numberedFileNames &= portret.isNumberedFileName(files[f]);
                result.pics.push(files[f]);
            } else if (fs.statSync(curFile).isDirectory()) {
                walkDir(curFile);
            }
        }
    }
    walkDir(path.join(portret.collectionPath, collection));
    result.count = result.pics.length;
    if (numberedFileNames) {
        console.log("Files in collection '%s' are numbered and will be played back in that order.", collection);
        result.pics.sort(portret.compareNumberedFileNames);
    }
    return result;
};

portret.isNumberedFileName = function (file) {
    var namepart = path.basename(file, path.extname(file));
    return (namepart.match(/^\d+$/) != null);
};

portret.compareNumberedFileNames = function (a, b) {
    var file_num_a = path.basename(a, path.extname(a));
    var file_num_b = path.basename(b, path.extname(b));
    return file_num_a - file_num_b;
};
