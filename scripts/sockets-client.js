var clicked = []		/// =  [{DOMnode, username}]
var clientUsers = [] ///  = ["name1", "name2", ...]
var userExists = false
var roomUsersClient = [] // users that are in a private chat can't join another
							// = [username1, username2 ...]

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return "style=color:"+color
}


$("#privateChat").attr("disabled", true)

function initSocket(callback) {
	var socket = io.connect("localhost:9998")

	socket.on("username", function(data) {
		window.username = data.username
		window.color = data.color
		$("#you").text("Logged as " +username)
		
		$('.sendMessage').submit(function(){ console.log("message sent: ",  $('#messageInput').val())
			socket.emit('chat message', {message:$('#messageInput').val(), username:window.username, color:window.color});
				$('#messageInput').val('');
				return false;
		})

		$("#privateChat").click(function(){
			var usersGroup = []
			clicked.forEach(function(elem, index){
				usersGroup.push(elem.username)
			})
			// push self in private chat
			usersGroup.push(window.username)
			socket.emit("new private room", usersGroup)
			// TODO .. show loading
		})

		socket.on('chat message', function(msg){
			$('#messages').append("<span class='username' "+msg.color+"> "+msg.username+" ></span>")
			$('#messages').append($('<li>').text(msg.message));  
		});

		
		socket.on("users list", function(allUsers) {
			if (allUsers.length > clientUsers.length) // user connected 
			{	
				//add users in clientUsers
				var $activeUsers = $("#activeUsers")
				allUsers.forEach(function(serverUser, index){
					if (clientUsers.indexOf(serverUser) === -1) {
						// user does not exist in my list
						clientUsers.push(serverUser)
						//mark if window.username
						var styleSelf = ""
						if (serverUser === window.username) {
							styleSelf = "activeUser"
						}
						//insert username in list
						$activeUsers.append("<div class='user "+styleSelf+"'>"+serverUser+"</div>")
						$("#activeUsers div:last-child").click(function(){
							
							if ($(this).text() !== window.username && roomUsersClient.indexOf($(this).text()) === -1) {
								// add listener for the new added node (new added is always last)

								console.log("not in room users", $(this).text())

								var self = this
								var pos = -1
								clicked.forEach(function(elem, index) {
									if (elem.node === self) {
										pos = index
									}
								})
								if ( pos === -1 ) {
									$(this).css("border", "2px solid #000099")
									clicked.push({node: this, username: serverUser})
									$("#privateChat").attr("disabled", false)
									console.log(clicked)
								} else {

									console.log("0px")

									clicked.splice(clicked.indexOf(this), 1)
									$(this).css("border", "0px")
									// $(this).removeClass("inRoom")
									if (clicked.length === 0)
										$("#privateChat").attr("disabled", true)
								}
							}


						})
					}
				})
			} else // user disconnected 
			{
				var pos1 = -1, pos2 = -1
				// search for the user that disconnected
				clientUsers.forEach(function(cliUser, index) {
					if (allUsers.indexOf(cliUser) === -1) {
						pos1 = index
					}
				})
				// delete the disconected user from clientUsers, clicked and from DOM
				var delUser = clientUsers[pos1]
				clientUsers.splice(pos1, 1)
				console.log(clientUsers)
				$(".user").each( function(index){
					if ($(this).text() === delUser)
						$(this.remove())
				})
				clicked.forEach(function(elem, index) {
					if (elem.username === delUser) {
						pos2 = index
					}
				})
				// if a selected user disconnected
				if (pos2 !== -1) {
					clicked.splice(pos2, 1)
					if (clicked.length === 0)
						$("#privateChat").attr("disabled", true)
				}
			}
			console.log(clicked, clientUsers)
		});


		socket.on("users in private rooms", function(roomUsers) { console.log("acuuuum")
			console.log("roomUsers", roomUsers)
			roomUsersClient = roomUsers
			$(".user").each(function(index) {
				if (roomUsers.indexOf($(this).text()) !== -1 ) {
					console.log("addClass", $(this).text())
					$(this).addClass("inRoom")
				} else {
					$(this).removeClass("inRoom")
					console.log("removeClass", $(this).text())
				}
			})
		})



		// code for the private rooms
		socket.on("user group", function(data){

			// data[] = {[usersGroup], namespace}

			console.log(data.usersGroup, "from ", window.username)

			data.usersGroup.forEach(function(user){
				var userNode = "<div class='privateList username"+user+"''>"+user+" </div>"
				$("#privateChatUsers").append(userNode)
			})

			//show modal
			$('#roomModal').modal("show")

			//conntets to the pribate chat (namespace)
			var roomSocket = io.connect("localhost:9998"+data.namespace)

			roomSocket.on("username", function() {
				roomSocket.emit("username", window.username)
			})

			roomSocket.on("chat message2", function(msg) {
				console.log(msg.username, msg.message)
				$('#messagesRoom').append("<span class='username modalMessage' "+msg.color+"> "+msg.username+" ></span>")
				$('#messagesRoom').append($('<li class="modalMessage">').text(msg.message))

			})

			// visual "is typing"
			var usersTyping = [] // [username1, username2 ... ]

			roomSocket.on("typing", function(data){
				if (data.username !== window.username) {
					console.log(data.username, " is typing")
					$("#activeUsersLabelRoom").css("display", "block")
					if (usersTyping.indexOf(data.username) === -1) {
						$("#activeUsersLabelRoom").prepend("<div class='userTyping "+data.username+"'></div>")
						$("#activeUsersLabelRoom div:first-child").css("background-color", "#"+(data.color.split("#"))[1])
						console.log(data.color)
						usersTyping.push(data.username)
					}
				}
			})

			roomSocket.on("not typing", function(data){
				if (data.username !== window.username) {
					$(".userTyping."+data.username).remove()
					usersTyping.splice(usersTyping.indexOf(data.username), 1)	
					if (usersTyping.length === 0 ){
						$("#activeUsersLabelRoom").css("display", "none")
					}
				}
			})



			// user left room
			roomSocket.on("user left room", function(username){
				console.log(username)
				var delUserSelector = "#privateChatUsers div.username"+username.username
				$(delUserSelector).remove()
			})





			var sendMessageFunction = function(){ 
				console.log("message sent : ",  $('#messageInputRoom').val())
				roomSocket.emit('chat message2', {message:$('#messageInputRoom').val(), username:window.username, color:window.color});
				$('#messageInputRoom').val('');
				return false;
			}

			$('#sendMessageRoom').click(sendMessageFunction)
			// send message on enter
			$('#messageInputRoom').keyup(function(e) {
				if(e.which == 13) {
					// if enter pressed send message
					if ($("#messageInputRoom").val() !== "") {
						sendMessageFunction()
						roomSocket.emit("not typing", {username: window.username, color: window.color})
					}
					return false
				} else if ($("#messageInputRoom").val() === ""){
					roomSocket.emit("not typing", {username: window.username, color: window.color})
				}
				else {
					// if other key pressed  is typing on socket
					roomSocket.emit("typing", {username: window.username, color: window.color})
				}

			})

			
			$("#roomModal").on("hide.bs.modal", function(){
				// remove selected users form clicked[]
				clicked.forEach(function(elem, index){
					$(elem.node).css("border", "0px")
				})
				clicked = []
				$("#privateChat").attr("disabled", true)

				//DONE? disconnect from namespace
				roomSocket.emit("please disconnect", window.username)
				
				$('#sendMessageRoom').off()
				$('#messageInputRoom').off()

				$(".modalMessage").remove()

				//clean private room list
				$("#privateChatUsers div").remove()

				// romove "hide.bs.modal" listener after work is done
				$("#roomModal").off()
				$("#roomModal").on("shown.bs.modal", function(){
					console.log("show roomModal")
					$("#messageInputRoom").focus()
				})
								
			})




		})


	})
	

	
	callback(socket)
}

