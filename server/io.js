var debug = require('debug')('bcsaid:io');

var io;

module.exports = {
    createServer : function(server) {
        io = require('socket.io')(server);

        io.on('connection', function(socket) {
            debug("websocket connected");

            socket.on('disconnect', function() {
                debug("websocket disconnected");
            });
        });
    }
};
