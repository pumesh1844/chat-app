const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./chat/chatMessage');
const mongoClient = require('mongodb').MongoClient;

const dbname = 'chatAplication';
const chatCollection = 'chats'; 
const userCollection = 'onlineUsers'; 

const port = 5000;
const database = 'mongodb://localhost:27017/';
const app = express();

const server=http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    console.log('New User Logged In with ID '+socket.id);
    
   
    socket.on('chatMessage', (data) =>{ 
        var dataElement = formatMessage(data);
        mongoClient.connect(database, (err,db) => {
            if (err)
                throw err;
            else {
                var onlineUsers = db.db(dbname).collection(userCollection);
                var chat = db.db(dbname).collection(chatCollection);
                chat.insertOne(dataElement, (err,res) => { 
                    if(err) throw err;
                    socket.emit('message',dataElement); 
                });
                onlineUsers.findOne({"name":data.toUser}, (err,res) => { 
                    if(err) throw err;
                    if(res!=null) 
                        socket.to(res.ID).emit('message',dataElement);
                });
            }
            db.close();
        });

    });

    socket.on('userDetails',(data) => { 
        mongoClient.connect(database, (err,db) => {
            if(err)
                throw err;
            else {
                var onlineUser = { 
                    "ID":socket.id,
                    "name":data.fromUser
                };
                var currentCollection = db.db(dbname).collection(chatCollection);
                var online = db.db(dbname).collection(userCollection);
                online.insertOne(onlineUser,(err,res) =>{ 
                    if(err) throw err;
                    console.log(onlineUser.name + " is online...");
                });
                currentCollection.find({ 
                    "from" : { "$in": [data.fromUser, data.toUser] },
                    "to" : { "$in": [data.fromUser, data.toUser] }
                },{projection: {_id:0}}).toArray((err,res) => {
                    if(err)
                        throw err;
                    else {
                        
                        socket.emit('output',res); 
                    }
                });
            }
            db.close();
        });   
    });  
    var userID = socket.id;
    socket.on('disconnect', () => {
        mongoClient.connect(database, function(err, db) {
            if (err) throw err;
            var onlineUsers = db.db(dbname).collection(userCollection);
            var myquery = {"ID":userID};
            onlineUsers.deleteOne(myquery, function(err, res) { 
              if (err) throw err;
              console.log("User " + userID + "went offline...");
              db.close();
            });
          });
    });
});

app.use(express.static(path.join(__dirname,'chat')));

server.listen(port, () => {
    console.log(`Chat Server listening to port ${port}...`);
});