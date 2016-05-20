var url = require("url")
var http = require("http")
var io = require('socket.io')(http);

function start(route, handle) {
	function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname
		console.log("Request for " + pathname + " received.")
		route(handle, pathname, response, request)
	}
	http.createServer(onRequest).listen(9999)
	console.log("Server has started (localhost:9999).")
}

exports.start = start
