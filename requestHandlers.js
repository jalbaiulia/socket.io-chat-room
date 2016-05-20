var fs = require("fs"),
	http = require("http")


function js(response, filename)  {
	fs.readFile(__dirname + filename, function(error, script){
		if (error) {
			response.writeHead(404)
			response.write("oops, can't load file ", filename)
			response.end()
		}
		else {
			response.writeHead(200, {"Content-Type": "application/javascript"})
			response.write(script)
			response.end()
		}
	})	
}

function css(response, filename)  {
	fs.readFile(__dirname + filename, function(error, styleSheet){
		if (error) {
			response.writeHead(404)
			response.write("oops, can't load file ", filename)
			response.end()
		}
		else {
			response.writeHead(200, {"Content-Type": "text/css"})
			response.write(styleSheet)
			response.end()
		}
	})	
}

function html(response, filename) {
	fs.readFile(__dirname + filename, function(error, data){
		if (error) {
			response.writeHead(404)
			response.write("oops, can't load file ", filename)
			response.end()
			
		}
		else {
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write(data, "utf8");
			response.end();
		}
	})	
}



exports.html = html
exports.js = js
exports.css = css





