socket = io ();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix:true
});

    document.getElementById("test1").style.display = "none";

let fromUser="";
let toUser="";


function storeDetails() {
    fromUser = document.getElementById('from').value;
    toUser = document.getElementById('to').value;
    element = document.querySelectorAll(".chat-messages");
    socket.emit('userDetails',{fromUser,toUser}); 
    disableTest();
}



function disableTest() {

    document.getElementById("test").disabled = true;
    var nodes = document.getElementById("test").getElementsByTagName('*');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].disabled = true;
    }
    document.getElementById("test").onclick = function() {

        document.getElementById("test").style.display = "none";
        document.getElementById("test1").style.display= "block";
    }
  }


chatForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    const msg = e.target.elements.msg.value;
    final = {
        'fromUser':fromUser,
        'toUser':toUser,
        'msg':msg
    };
    socket.emit('chatMessage',final); 
    document.getElementById('msg').value=" ";
});



socket.on('output',(data) => { 
    for(var i=0; i<data.length;i++) {
        outputMessage(data[i]);
    }
    chatMessages.scrollTop=chatMessages.scrollHeight;
});

socket.on('message',(data) => { 
        outputMessage(data);
        console.log(data);
    chatMessages.scrollTop=chatMessages.scrollHeight;
});

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`
    <p class ="text" >
        ${message.message}
    </p> <p class="meta">${message.from}<span> ${message.time}, ${message.date}</span></p>`
    ;
    document.querySelector('.chat-messages').appendChild(div);
}