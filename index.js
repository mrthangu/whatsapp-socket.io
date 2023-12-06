import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: 'https://whatsapp.mrzera.xyz',
        methods: ['GET', 'POST'],
    },
});

let users = [];


const addUser = (userData, socketId) => {
    !users.some(user => user.sub === userData.sub) && users.push({ ...userData, socketId });
};

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find(user => user.sub === userId);
};
io.use((socket, next) => {
    // Set CORS headers here
    socket.handshake.headers['Access-Control-Allow-Origin'] = 'https://whatsapp.mrzera.xyz';
    next();
});

io.on('connection', (socket) => {
    console.log('user connected');

    // Connect
    socket.on('addUser', (userData) => {
        addUser(userData, socket.id);
        io.emit('getUsers', users);
    });

    // Send message
    socket.on('sendMessage', (data) => {
        const user = getUser(data.receiverId);
        if (user) {
            io.to(user.socketId).emit('getMessage', data);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
        removeUser(socket.id);
        io.emit('getUsers', users);
    });
});

httpServer.listen(1000, '0.0.0.0', () => {
    console.log('Server is listening on port 1000');
});

