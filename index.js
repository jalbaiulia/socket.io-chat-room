var server = require("./server")
var router = require("./router")
var requestHandlers = require("./requestHandlers")


var handle = {}
handle[".html"] = requestHandlers.html
handle[".js"] = requestHandlers.js
handle[".css"] = requestHandlers.css

server.start(router.route, handle)	