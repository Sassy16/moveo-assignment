require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require("./routes/auth");
const songsRoutes = require("./routes/songs");
const socketHandler = require('./socket-handler');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// === Middleware ===
app.use(cors());
app.use(express.json());

// === API Routes ===
app.use("/api/auth", authRoutes);
app.use("/api/songs", songsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

console.log("Environment PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Mongo URI (masked):", process.env.MONGO_URI ? "✅ Loaded" : "❌ Missing");

// === MongoDB Connection ===
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// === Serve React Frontend in Production ===
if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "../client/build");
  app.use(express.static(clientPath));
  console.log("✅ Serving React build from:", clientPath); // <-- added debugging line

  // Handle React routing, return all requests to index.html
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
} else {
  console.log("🧩 Development mode — React app not being served by Express");
}

// === Socket.io Setup ===
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);
  socketHandler(io, socket);
});

// === Start Server ===
const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
