$(document).ready(function(){
	
	var options = {
	    "backdrop" : "static"
	}
	$('#basicModal').modal(options)

	var registerFunction = function() {

		$("#usernameExists").css("display", "none")
		$("#notAllowed").css("display", "none")
		$("#noInput").css("display", "none")

		if ( $("#registerInput").val() === "") {
			$("#noInput").css("display", "block")
		}
		else {

			var userExists = false
			var newUser = $("#registerInput").val()

			var nameNotAllowed = ".username"+newUser
			console.log(nameNotAllowed)
			if ($(nameNotAllowed).length){
				$("#notAllowed").css("display", "block")
			} else {
				initSocket( function(socket){
					socket.emit("add-user", {"username": newUser});
					
					socket.on("username exists", function(exists) {
						if (exists) {
							$("#usernameExists").css("display", "block")
						} else {
							$('#basicModal').modal("hide")
							$("#registerInput").attr("autofocus", false)
							$("#messageInput").focus()
						}
					})
				})
			}
		}

	}

	$("#registerButton").click( registerFunction )
	$('#registerInput').keypress(function(e) {
		if(e.which == 13) {
			registerFunction()
		}
	})



	// room modal

	$("#roomModal").on("shown.bs.modal", function(){
		console.log("show roomModal")
		$("#messageInputRoom").focus()
	})
	$("#roomChat").click(function(){
		$("#messageInputRoom").focus()
	})

	





})