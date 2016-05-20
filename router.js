function route(handle, pathname, response, request) {
	console.log("About to route a request for " + pathname)
	if (pathname === "/") 
		pathname = "/index.html"
	
	var type = pathname.substring(pathname.lastIndexOf("."), pathname.length)
	console.log(type)
	if (typeof handle[type] === 'function') {
		handle[type](response, pathname)
	} else {
		console.log("No request handler found for " + pathname)
		response.writeHead(404, {"Content-Type": "text/html"})
		response.write("404 Not found")
		response.end()
	}
}

exports.route = route