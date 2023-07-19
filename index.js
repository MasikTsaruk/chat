const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const users = []


app.use(express.static(__dirname + '/public'));

app.get('/', (req, res, next) => {
    res.sendfile(__dirname + '/index.html');
});

io.on('connection', (socket)=>{
    socket.on('login', (data)=>{
        const found = users.find((nickname)=> {
            return nickname === data;
        })
        if(!found){
            users.push(data);
            socket.nickname = data
            io.sockets.emit('login', {'status' : 'OK'});
            io.sockets.emit('users', {users})
        }
        else{
            io.sockets.emit('login', {'status' : 'FAILED'});
        }
    });

    socket.on('message', (data)=>{
        io.sockets.emit('new message' ,{
            message : data,
            time : new Date(),
            nickname : socket.nickname
        });
    });

    socket.on('disconnect', (data)=>{
        for(let i = 0; i < users.length; i++){
            if (users[i] === socket.nickname){
                users.splice(i, 1)
            }
        }
        io.sockets.emit('users', {users})
    });
});

server.listen(3000, () => {
    console.log("Date: " + new Date());
})