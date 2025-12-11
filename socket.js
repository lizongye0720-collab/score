const { Server } = require('socket.io');

module.exports = (req, res) => {
    // 修复1：兼容Vercel Serverless
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server, {
            path: '/api/socket.js',
            cors: {
                origin: "*", // 跨域兼容
                methods: ["GET", "POST"]
            }
        });

        // 修复2：完善事件处理
        io.on('connection', (socket) => {
            console.log('客户端连接:', socket.id);
            
            socket.on('broadcastUpdate', (data) => {
                socket.broadcast.emit('dataUpdated', data);
                socket.emit('dataUpdated', data); // 给自己也发一份
            });

            socket.on('disconnect', () => {
                console.log('客户端断开:', socket.id);
            });
        });

        res.socket.server.io = io;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).end();
};
