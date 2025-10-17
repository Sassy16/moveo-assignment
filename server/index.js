require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { ok } = require('assert');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const authRoutes = require("./routes/auth");
const songsRoutes = require("./routes/songs");

const socketHandler = require('./socket-handler');

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB atlas"))
.catch(err => console.error("MongoDB connection error: ", err));

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/songs", songsRoutes);

app.get('/api/health', (req, res) => {
    res.json({ok: true});
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
    socketHandler(io, socket)
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
