var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};


function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200,
        {"content-type": mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}


function serveStatic(response, cache, abspath) {
    if (cache[abspath]) {
        sendFile(response, abspath, cache[abspath]);
    }
    else {
        fs.exists(abspath, function(exists) {
            if (exists) {
                fs.readFile(abspath, function(err, data) {
                    if (err) {
                        send404(response);
                    }
                    else {
                        cache[abspath] = data;
                        sendFile(response, abspath, data);
                    }
                });
            } else {
                send404(response);
            }
        });
    }
}

var server = http.createServer(function(request, response) {
    var filepath = false;

    if (request.url == '/') {
        filepath = 'public/index.html';
    }
    else {
        filepath = 'public' + request.url;
    }
    var abspath = './' + filepath;
    serveStatic(response, cache, abspath);
})

server.listen(3000, function() {
    console.log("Server listening on port 3000.");
});

var chatserver = require('./lib/chat_server');
chatserver.listen(server);