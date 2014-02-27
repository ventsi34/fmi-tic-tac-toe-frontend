$(document).ready(function() {
	$('#register-btn').tooltipster();
	logInChecker();

	//add functions to buttons
	$('#register-btn').click(function(){
		$('#register-form-container').stop().toggle('slow');
		$('html, body').animate({
        	'scrollTop': $("#register-form-container").offset().top
         }, 500);
	});
	$('#send-reg-form-btn').click(register);
	$('#login-btn').click(logIn);
	$('#exit-btn').click(logOut);
	$('#welcome-text').html("Добре дошъл, " + localStorage.userName);
	// execution when user open home.html page
	if(getFileName() == "home.html"){
        setInterval(function(){ getOnlineUsers() }, 10000);
        getOnlineUsers();
        setInterval(function(){ getNotification() }, 2000);
        getNotification();
        showGameInvitation();
    }
	// execution when user open game.html page
    if(getFileName() == "game.html" && localStorage.gameStatus == 1){
    	setInterval(function(){ getGameNotification() }, 400);
        $('#gameOpponentName').html(localStorage.gameOpponent);
        userTurnChecker();
        drawGameElements();
        $('#close-game-btn').click(quitGame);
        $('#close-game-btn').hover(
	        function(){
	        	$(this).stop().animate({
					"margin-top": "2px"
				}, 500);
	        },
	        function(){
	        	$(this).stop().animate({
					"margin-top": "5px"
				}, 500);
	    })

	    $('html, body').animate({
        	'scrollTop': $("#container").offset().top
        }, 500);
    }

});

//================== MAIN COMMON FUNCTIONS ========================//

//path to services
var serverURL = "http://localhost/sea-chess/services/";

// ajax post request function
function performPostRequest(serviceUrl, data, onSuccess, onError){
	onError = typeof onError !== 'undefined' ? onError : function(){};
    $.ajax({
        url: serverURL + serviceUrl,
        type: "POST",
        dataType: "json",
        data: data
    }).done(onSuccess).fail(onError);
}

//Check user state and relocate him to right page
function logInChecker(){
    if(localStorage.getItem('sessionId') == undefined){
        if(getFileName() != "index.html"){
            window.location = "index.html";
        }
    }
    else
    {
        if(localStorage.getItem('sessionId').length != 40 && getFileName() != "index.html"){
            window.location = "index.html";
        }
        if(localStorage.getItem('sessionId').length == 40 &&
        	getFileName() == "index.html" && localStorage.gameStatus != 1){
            window.location = "home.html";
        }
        if(localStorage.gameStatus == 1 && getFileName() != "game.html"){
        	window.location = "game.html";
        }
    }
}

//This function return filename
function getFileName(){
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/')+1);
    return filename;
}

//====== USER OBJECT FUNCTIONS ======//

//Set user object in localStorage and save all usernames in common list
function setGameObject(userName, obj){
	var newUsername = 'usr_' + userName;
	localStorage.setItem(newUsername, JSON.stringify(obj));
	if(localStorage.getItem("gameUsersList") == undefined){
		var list = new Array();
		list[0] = userName;
		localStorage.setItem("gameUsersList", JSON.stringify(list));
	}
	else
	{
		var list = JSON.parse(localStorage.gameUsersList);
		list.push(userName);
		localStorage.gameUsersList = JSON.stringify(list);
	}
}

//Return user object from localStorage 
function getGameObject(userName){
	return JSON.parse(localStorage.getItem('usr_' + userName));
}

//Remove user from localStorage and list with all user objects
function removeGameObject(userName){
	var usersList = getGameObjectsList();
	if(!usersList || (localStorage.getItem('usr_' + userName) == undefined)){
		return false;
	}
	localStorage.removeItem('usr_' + userName);
	var newArr = new Array();
	for (var i = 0; i < usersList.length; i++) {
		if(usersList[i] != userName){
			newArr.push(usersList[i]);
		}
	};
	localStorage.gameUsersList = JSON.stringify(newArr);
}

//Return list with all users objects saved in localStorage 
function getGameObjectsList(){
	if(localStorage.gameUsersList == undefined){
		return false;
	}
	return JSON.parse(localStorage.gameUsersList);
}

//Verify that the username is contained in the list with all users
function arrayContentChecker(str, userArray){
	for (var i = 0; i < userArray.length; i++) {
		if(userArray[i] == str){
			return true;
		}
	};
	return false;
}

//Show custom error message
function showErrorMessage(msg, hide){
	var htmlContent = '<div class="container-fluid">'+
		'<p id="errMessageText">'+ msg +'</p>'+
	'</div>';
	$('#errorMessage').html(htmlContent).show();
	$("html, body").animate({ scrollTop: 0 }, "slow");
	if(hide == 1){
		setInterval(function(){
			$('#errorMessage').hide();
		}, 10000)
	}
}

//This function send logOut request to server and remove user session
function logOut(e){
	var data = {
		"session": localStorage.sessionId
	};
	performPostRequest("logout.php", data, function(data){
		localStorage.clear();
		logInChecker();
	});
}

//This function check username by regex
function userNameChecker(name){
    var pattern = /^[A-Za-z0-9\-_\.]{4,30}$/;
    if(pattern.test(name)){
        return true;
    }
    return false;
}

//set hover effect
function setHover(selector){
	$(selector).hover(
		function(){
			$(this).stop().animate({
				"background-position-y": "-3px"
			}, 500)
		},
		function(){
			$(this).stop().animate({
				"background-position-y": "0"
			}, 500)
		});
	
}
//================== INDEX PAGE FUNCTIONALITIES ========================//

//This function create user profils and user session
function register(e){
	e.preventDefault();
	var userName = $('#register-username').val();
	var userPass = $('#register-pass').val();
	if(userNameChecker(userName) && userPass.length > 3 && userPass.length < 30){
		var data = {
			"userName": $.trim(userName),
			"pass": $.trim(userPass)
		};
		performPostRequest("register.php", data, function(data){
			if(data.error == 1){
				switch(data.errNum) {
					case 450:
						showErrorMessage("Потребителското име и паролата са невалидни!");
						break;
					case 451:
						showErrorMessage("Потребителското име е невалидно!");
						break;
					case 452:
						showErrorMessage("Паролата е невалидна!");
						break;
					case 453:
						showErrorMessage("Потребителското име вече съществува!");
						break;
				}
			}
			else
			{
				localStorage.setItem("sessionId", data.sessionId);
				localStorage.setItem("userName", userName);
				logInChecker();
			}
		});
	}
	else
	{
		showErrorMessage("Потребителското име и паролата са невалидни!");
	}
}

//This function create request to server and user session
function logIn(e){
	e.preventDefault();
	var userName = $('#login-username').val();
	var userPass = $('#login-pass').val();
	if(userNameChecker(userName) && userPass.length > 3 && userPass.length < 30){
		var data = {
			"userName": $.trim(userName),
			"pass": $.trim(userPass)
		};
		performPostRequest("login.php", data, function(data){
			if(data.error == 1){
				switch(data.errNum) {
					case 450:
						showErrorMessage("Потребителското име или паролата са невалидни!");
						break;
					case 451:
						showErrorMessage("Потребителското име е невалидно!");
						break;
					case 453:
						showErrorMessage("Потребителското име или паролата са невалидни!");
						break;
				}
			}
			else
			{
				localStorage.setItem("sessionId", data.sessionId);
				localStorage.setItem("userName", userName);
				logInChecker();
			}
		});
	}
	else
	{
		showErrorMessage("Потребителското име и паролата са невалидни!");
	}
}

//================== HOME PAGE FUNCTIONALITIES ========================//

//Make request to server and get all online users
function getOnlineUsers(e){
	var data = {
		"session": localStorage.sessionId
	}
	performPostRequest("online-users.php", data, function(data){
		switch(data.status) {
			case 470:
				logOut();
				break;
			case 200:
				showOnlineUsersHtml(data);
				break;
		}
	});
}

//This function display all online users 
function showOnlineUsersHtml(data){
	synchronizeGameInvitations(data.users);
	var html = "";
	for (var i = 0; i < data.users.length; i++) {
		if(data.users[i].toLowerCase() != localStorage.userName.toLowerCase()){
			html += '<div class="user-profil clear">'+
				'<div class="clear" data-name="'+ data.users[i]+'">'+
					'<img src="img/user.png" alt="user-image" width="48" height="48"/>'+
					'<p>'+ data.users[i] +'</p>'+
				'</div>'+
				'<button type="button" class="game-btn" data-name="'+ data.users[i] +'" title="Покани на игра"></button>'+
			'</div>';
		}
	};
	$('#online-usr-cont').html(html);
	setHover('#online-usr-cont .game-btn');
	$('#online-usr-cont .game-btn').click(inviteToGame);
	$('#online-usr-cont .user-profil div').click(inviteToGame);
	//$('#online-usr-cont .game-btn').tooltipster();
}

//Remove invitation from offline users
function synchronizeGameInvitations(arr){
	if(arr == undefined){
		return false;
	}
	if(arr.length != 0){
		var gameInvitationsList = getGameObjectsList();
		if(!gameInvitationsList){
			return false;
		}
		var newArr = new Array();
		for (var i = 0; i < gameInvitationsList.length; i++) {
			if(arrayContentChecker(gameInvitationsList[i], arr)){
				newArr.push(gameInvitationsList[i]);
			}
		};
		localStorage.gameUsersList = JSON.stringify(newArr);
		showGameInvitation();
	}
}

//Send game invitation to user
function inviteToGame(e){
	var recipientName =  $(this).data("name");
	if(userNameChecker(recipientName)){
		if( !arrayContentChecker( recipientName, getGameObjectsList() ) || 
			localStorage.gameUsersList == undefined){
			var userObject = {
				"name" : recipientName,
				"status" : 0,
				"gameFlag" : 1
			}
			setGameObject(recipientName, userObject);
			var data = {
				'session': localStorage.sessionId,
				'recipientName': $.trim(recipientName)
			}
			performPostRequest("invite-user.php", data, function(data){
				switch(data.status) {
					case 470:
						logOut();
						break;
					case 450:
						removeGameObject(recipientName);
						showErrorMessage("Възникна грешка при опита за покана на този потребител!", 1);
						break;
					case 400:
						removeGameObject(recipientName);
						showErrorMessage("Този потребител в момента играе! Моля опитайте по-късно.", 1);
						break;
					case 200:
						userObject = getGameObject(recipientName);
						userObject.gameNum = data.gameNum;
						showGameInvitation();
						break;
				}
			});
		}
		else
		{
			showErrorMessage("Вече сте поканили този потребител!", 1);
		}
	}
	else
	{
		showErrorMessage("Възникна проблем при опита за покана на този потребител!");
	}
}

//This function send response to user invitation
function responseGameInvitation(e){
	var recipientName = $(this).data("name");
	if(recipientName == undefined || localStorage.gameTurn != undefined){
		return false;
	}
	if(userNameChecker(recipientName)){
		var recipientGameObject = getGameObject(recipientName);
		var data = {
			"recipientName": recipientName,
			"session" : localStorage.sessionId,
			"gameNum" : recipientGameObject.gameNum
		};
		localStorage.setItem("gameTurn", 0);
		performPostRequest("invitation-response.php", data, function(data){
			switch(data.status) {
				case 470:
					localStorage.removeItem('gameTurn');
					logOut();
					break;
				case 200:
					localStorage.setItem("gameAreaClickCounter", 0);
					localStorage.setItem("currentGameNum", recipientGameObject.gameNum);
					beginGame(recipientName);
					break;
				case 400:
					localStorage.removeItem('gameTurn');
					showErrorMessage("Този потребител вече играе с друг играч!", 1);
					break;
				default:
					localStorage.removeItem('gameTurn');
			}
		});
	}
	else
	{
		showErrorMessage("Възникна проблем при опита за отговор на тази покана за игра!");
	}
}

//====== GET NOTIFICATIONS FUNCTIONALITY ======//

// This function get game invitation from server
function getNotification(){
	var data = {
		"session" : localStorage.sessionId
	}
	performPostRequest("get-notifications.php", data, function(data){
		switch(data.status) {
			case 470:
				logOut();
				break;
			case 200:
				getGameInvitation(data);
				break;
			case 201:
				localStorage.setItem("gameAreaClickCounter", 1);
				localStorage.setItem("gameTurn", 1);
				localStorage.setItem("currentGameNum", data.gameNum);
				beginGame(data.creatorName);
				break;
		}
	});
}

// This function make user object in localStorage and redraw all user game invitations
function getGameInvitation(data){
	var userList = getGameObjectsList();
	if(userList != false){
		if(arrayContentChecker(data.creatorName, userList)){
			removeGameObject(data.creatorName);
		}
	}
	var json = {
		"name" : data.creatorName,
		"status" : 1,
		"gameNum" : data.gameNum,
		"gameFlag" : 0
	};
	setGameObject(data.creatorName, json);
	showGameInvitation();
	getOnlineUsers();
	getNotification();
}

//This function display all user game invitations
function showGameInvitation(){
	var gameInvitationsList = getGameObjectsList()
	var html = "";
	if(typeof(gameInvitationsList) == "object"){
		for (var i = 0; i < gameInvitationsList.length; i++) {
			userObject = getGameObject(gameInvitationsList[i]);
			if(userObject.status == "1" || userObject.status == "0"){
				html += '<div class="user-profil clear">';
				if(userObject.status == "1"){
					html += '<div class="clear" data-name="'+ userObject.name +'">';
				}
				else
				{
					html += '<div class="clear">';
				}
				html +='<img src="img/user.png" alt="user-image" width="48" height="48"/>'+
						'<p>'+ userObject.name +'</p>'+
					'</div>';
				if(userObject.status == "1"){
					html += '<button type="button" class="game-btn" data-name="'+ userObject.name +'" title="Започни игра"></button>';
				}
				html += '</div>';
			}
		};
	}
	$('#invitation-usr-cont').html(html);
	setHover('#invitation-usr-cont .game-btn');
	$('#invitation-usr-cont .game-btn').click(responseGameInvitation);
	$('#invitation-usr-cont .user-profil div').click(responseGameInvitation);
}

//================== GAME PAGE FUNCTIONALITIES ========================//

//This function set settings for game beginning
function beginGame(userName){
	if(getGameObject(userName) == undefined){
		return false;
	}
		localStorage.setItem("gameStatus", 1);
		localStorage.setItem("gameOpponent", userName);
		var userObject = getGameObject(userName);
		userObject.status = 2;
		localStorage.setItem("gameFlag", userObject.gameFlag);
		window.location = "game.html";
}

//Close current game and relocate to home.html
function quitGame(e){
	localStorage.removeItem("userTurnCounter");
	localStorage.removeItem("gameArrayMap");
	localStorage.removeItem("gameAreaClickCounter");
	localStorage.removeItem("gameTurn");
	localStorage.removeItem("gameFlag");
	localStorage.removeItem("gameStatus");
	removeGameObject(localStorage.gameOpponent);
	var json = {
		'session': localStorage.sessionId,
		'gameNumber': localStorage.currentGameNum
	}
	performPostRequest("close-game.php", json, function(){
		var opponentObjName = 'usr_' + localStorage.gameOpponent;
		localStorage.removeItem(opponentObjName);
		localStorage.removeItem("gameOpponent");
		localStorage.removeItem("gameWinnerName");
		localStorage.removeItem("currentGameNum");
		window.location = "home.html";
	});
}

//Check who is the user on turn
function userTurnChecker(){
	if(evenGameChecker()){
		$('#game-container').css("opacity", "0.6");
		$("#user-turn-container p").css("color", "#a00");
		$('#user-turn-container p').html("Играта завърши без победител!");
		return false;
	}
	if(localStorage.gameTurn != 1){
		$('#game-container').css("opacity", "0.6");
		$('#user-turn-container p').html("В момента играе " + localStorage.gameOpponent);
	}
	else
	{
		$('#game-container').css("opacity", "1");
		$('#user-turn-container p').html("Ваш ред е!");
		$('.game-area').click(setUserTurn)
	}
}

//Send result from user turn to server
function setUserTurn(e){
	var colNum = $(this).data("col");
	var rowNum = $(this).data("row");
	if(checkMapPosition(rowNum, colNum)){
		if(localStorage.gameAreaClickCounter != 1 || 
			setElementInGameMap(rowNum, colNum, localStorage.gameFlag) == false){
			return false;
		}
		localStorage.gameTurn = 0;
		setUserTurnInCounter();
		userTurnChecker();
		localStorage.gameAreaClickCounter = 0;
		if(colNum >= 0 && colNum < 3 && rowNum >= 0 && rowNum < 3){
			var data = {
				"session": localStorage.sessionId,
				"recipientName": localStorage.gameOpponent,
				"gameNum": localStorage.currentGameNum,
				"row": rowNum,
				"col": colNum,
				"flag": localStorage.gameFlag
			}
			performPostRequest("set-game-turn.php", data, function(data){
				switch(data.status) {
					case 201:
						localStorage.gameWinnerName = localStorage.userName;
						$("#user-turn-container p").css("color", "#a00");
						$("#user-turn-container p").html("Браво вие победихте!");
						break;
					case 204:
						showErrorMessage("Вашият опонент напусна играта!");
						break;
					case 470:
						logOut();
						break;
				}
			});
		}
		else
		{
			showErrorMessage("Няма такава клетка в играта!");
		}
	}
}

//====== GET GAME NOTIFICATIONS FUNCTIONALITY ======//

//This function get game events notifications from server
function getGameNotification(){
	var json = {
		'session': localStorage.sessionId,
		'gameNumber': localStorage.currentGameNum,
		'gameOpponent': localStorage.gameOpponent,
		'userGameFlag': localStorage.gameFlag
	};
	performPostRequest("get-game-notification.php", json, function(data){
		switch(data.status) {
			case 202:
				setElementInGameMap(data.row, data.col, getGameOpponentFlag());
				localStorage.gameAreaClickCounter = 1;
				localStorage.gameTurn = 1;
				setUserTurnInCounter();
				userTurnChecker();
				break;
			case 200:
				declareWinner(data);
				break;
			case 204:
				showErrorMessage("Вашият опонент напусна играта!");
				break;
			case 470:
				logOut();
				break;
		}
	});
}

//Make user winner
function declareWinner(obj){
	if(localStorage.gameWinnerName == undefined){
		localStorage.gameWinnerName = localStorage.gameOpponent;
		$("div[data-row='"+ obj.row +"'][data-col='"+ obj.col +"']").html( getGameContent( getGameOpponentFlag() ) );
		$("#user-turn-container p").css("color", "#a00");
		$("#user-turn-container p").html("Победител е " + localStorage.gameWinnerName);
	}
}

//====== GAME COMMON FUNCTIONS ======//

//Return opponent flag num
function getGameOpponentFlag(){
	if(localStorage.gameFlag == 0){
		return 1;
	}
	return 0;
}

//Return html string for show in game area
function getGameContent(flag){
	if(flag == 1){
		return "<p>X</p>";
	}
	return "<p>0</p>";
}

//Set game turn result in game map and redraw all user game turns
function setElementInGameMap(row, col, flag){
	if(localStorage.gameArrayMap == undefined){
		var arr = new Array(3);
		arr[0] = new Array(3);
		arr[1] = new Array(3);
		arr[2] = new Array(3);
		localStorage.setItem("gameArrayMap", JSON.stringify(arr))
	}
	if(row >= 0 && row < 3 && col >= 0 && col < 3 && (flag == 1 || flag == 0)){
		arr = JSON.parse(localStorage.gameArrayMap);
		if(arr[row][col] != undefined){
			return false;
		}
		arr[row][col] = flag;
		localStorage.gameArrayMap = JSON.stringify(arr);
	}
	drawGameElements();
}

//Draw all user game turns
function drawGameElements(){
	if(localStorage.gameArrayMap != undefined){
		arr = JSON.parse(localStorage.gameArrayMap);
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				if(arr[i][j] == 1 || arr[i][j] == 0){
					$("div[data-row='"+i+"'][data-col='"+j+"']").html( getGameContent(arr[i][j]) );
				}
			};
		};
	}
}

//Check for empty positions of map
function checkMapPosition(row, col){
	if(row >= 0 && row < 3 && col >= 0 && col < 3){
		if(localStorage.gameArrayMap == undefined){
			return true;
		}
		arr = JSON.parse(localStorage.gameArrayMap);
		if(arr[row][col] != 0 && arr[row][col] != 1){
			return true;
		}
		return false;

	}
	return false;
}

//Check for game end without winner
function evenGameChecker(){
	if(localStorage.userTurnCounter != undefined){
		if(localStorage.userTurnCounter == 9 && localStorage.gameWinnerName == undefined){
			return true;
		}
		return false;
	}
	return false;
}

//Count and return every user turn
function setUserTurnInCounter(){
	if(localStorage.userTurnCounter == undefined){
		localStorage.userTurnCounter = 1;
		return 1;
	}
	return localStorage.userTurnCounter = parseInt(localStorage.userTurnCounter) + 1;
}