var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs")


// clients=[{username: "name1", socket: socket}, .... ]
var clients = []
// allUsers = ["username1", username2]
var allUsers = []
// the name of a namespace for a room
var rooms = [] // [ {roomName,  usersGroup, namespace}, ... ]
// users in private chat [username1, username2 ... ]
var roomUsers = []



function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


io.on('connection', function(socket){
	
	

	socket.on('add-user', function(data){	
	    
	    if (allUsers.indexOf(data.username) === -1) {
		    var color = "style=color:"+getRandomColor()
		    socket.emit("username", { username: data.username, color: color})
		    socket.emit("username exists", false)
		    allUsers.push(data.username)
		    clients.push({ username: data.username, socket: socket})
		    io.emit('users list', allUsers)
		    socket.emit("users in private rooms",  roomUsers)
		} else {
			socket.emit("username exists", true)
		}
	  })

	socket.on('disconnect', function(){
		clients = clients.filter(function(client, index, clients) {
			if (client.socket.id === socket.id) {
				allUsers.splice(allUsers.indexOf(client.username), 1)
				io.emit('users list', allUsers)
				return false
			}
			else
				return true
		})
	});

	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});



	socket.on("new private room", function(usersGroup) {

		

		var roomExists = true
		var roomName
		while(roomExists){
			roomName = "/room" + getRandomColor().replace("#", "")
			roomExists = false
			rooms.forEach(function(elem, index){
				if (elem.roomName === roomName) {
					roomExists = true
				}
			})
		}

		console.log(roomName)

		var nsp = io.of(roomName);

		clients.forEach(function(elem, index){
			if (usersGroup.indexOf(elem.username) !== -1) {
			    roomUsers.push(elem.username)
				elem.socket.emit("user group", {usersGroup: usersGroup, namespace: roomName})
			}
		})

		io.emit("users in private rooms",  roomUsers)

		nsp.on('connection', function(roomSocket){

		 	console.log('someone connected')

		  	var usernameSocket
		  	roomSocket.emit("username")
		  	roomSocket.on("username", function(username){
		  		usernameSocket = username
		  	})
		  
			roomSocket.on("chat message2", function(msg){
				console.log('chat message2: ' + msg)
				nsp.emit('chat message2', msg)
			})

			
			roomSocket.on('please disconnect', function(username){ 
				roomSocket.disconnect()
			});

			roomSocket.on("disconnect", function(){
				roomUsers.splice(roomUsers.indexOf(usernameSocket), 1)
				console.log('server disconeccts form room', usernameSocket, roomUsers)
				io.emit("users in private rooms",  roomUsers)
				nsp.emit("user left room", {username: usernameSocket})
				console.log("disconnected", usernameSocket)
			})

			// TODO try to send direct from client
			roomSocket.on("typing", function(data){
				nsp.emit("typing", data)
			})

			roomSocket.on("not typing", function(data){
				nsp.emit("not typing", data)
			})



			

			
		
		});

	});

});

http.listen(9998, function(){
  console.log('listening on *:9998');
});



