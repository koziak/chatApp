var usernamePage = document.querySelector('#usernamePage');
var onlineListWrapper = document.querySelector('#onlineListWrapper');
var onlineList = document.querySelector('#onlineList');
var chatWindow = document.querySelector('#chatWindow');

var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');

var stompClient = null;
var username = null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

console.log(usernamePage);

function connect(event) {
    username = document.querySelector('#name').value.trim();

    if(username) {
        usernamePage.classList.add('hidden');
        chatWindow.classList.remove('hidden');
		onlineListWrapper.classList.remove('hidden');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}


function onConnected() {

    // Subscribe
    stompClient.subscribe('/channel/public', onMessageReceived);

    // Set username
    stompClient.send("/app/chat.joinChat",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    );
}


function onError() {
    // If connection failed
	console.log('Error');
}


function sendMessage(event) {

    var messageContent = messageInput.value.trim();

    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
	
    var message = JSON.parse(payload.body);
	var username = message.sender.replace(/\s/g, '');

    if(message.type === 'JOIN') {
		addUser(username);
		
    } else if (message.type === 'LEAVE') {
        removeUser(username);
		
    } else {
        addMessage(message.content, username);
    }
}


function getAvatarColor(messageSender) {
	
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
}

function addUser(username) {

	var userElement = document.createElement('div');
	userElement.classList.add('user');
	userElement.setAttribute("id", username);
	
	var name = document.createElement("h4");
	var nameText = document.createTextNode(toTitleCase(username));
	name.appendChild(nameText);
	
	var avatarLetter = document.createElement("h4");
	var nameInitial = document.createTextNode(username.charAt(0).toUpperCase());
	avatarLetter.appendChild(nameInitial);
	
	var avatar = document.createElement("div");
	avatar.classList.add("user-image");
	avatar.style['background-color'] = getAvatarColor(username);
	avatar.appendChild(avatarLetter);
	
	userElement.appendChild(avatar);
	userElement.appendChild(name);
	
	onlineList.appendChild(userElement);
}

function removeUser(username) {
	
	var userElement = document.getElementById(username);
    userElement.remove();
}

function addMessage(content, username) {
	
	var messageElement = document.createElement("div");
	messageElement.classList.add("message");
	
	var messageContent = document.createElement("p");
	var messageText = document.createTextNode(content);
	messageContent.appendChild(messageText);
	
	var avatarLetter = document.createElement("h4");
	var nameInitial = document.createTextNode(username.charAt(0).toUpperCase());
	avatarLetter.appendChild(nameInitial);
	
	var avatar = document.createElement("div");
	avatar.classList.add("user-image");
	avatar.style['background-color'] = getAvatarColor(username);
	avatar.appendChild(avatarLetter);
	
	messageElement.appendChild(avatar);
	messageElement.appendChild(messageContent);
	
	messageArea.appendChild(messageElement);
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);