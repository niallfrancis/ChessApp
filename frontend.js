$(function () {
  // for better performance - to avoid searching in DOM
  var content = $('#content');
  var users = $('#users');
  var input = $('#input');
  var status = $('#status');
  // my color assigned by the server
  var myColor = false;
  // my name sent to the server
  var myName = false;

  // open connection
  var connection = new WebSocket('ws://localhost:1337');
  connection.onopen = function () {
    // first we want users to enter their names
    input.removeAttr('disabled');
    status.text('Choose name:');
  };



  connection.onmessage = function (message) {
    console.log("message Received");
    var json = JSON.parse(message.data);
    //New user connected to lobby
    if (json.type === 'colour') {
      status.text(myName + ': ').css('color', json.data.colour);
      updateUsers(json.data.users)
    } else if (json.type === 'updateUsers') {
      console.log("update users");
      var obj = json.data;
      updateUsers(obj.users)
    }

  };

  function updateUsers(userList) {
    users.empty();
    console.log(userList);
    for (var i = 0; i < userList.length; i++) {
      console.log(userList[i].username);
      users.append('<ul>' + userList[i].username + '</ul>')
    }
  }


  input.keydown(function(e) {
    if (e.keyCode === 13) {
      var msg = $(this).val();
      if (!msg) {
        return;
      }
      // send the message as an ordinary text
      connection.send(msg);
      $(this).val('');
      // disable the input field to make the user wait until server
      // sends back response
      input.attr('disabled', 'disabled');
      // we know that the first message sent from a user their name
      if (myName === false) {
        myName = msg;
      }
    }
  });

});
