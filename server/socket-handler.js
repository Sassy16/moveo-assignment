const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

module.exports = (io, socket) => {
  socket.on("join-session", ({ token }) => {
    try {
      const user = jwt.verify(token, JWT_SECRET);
      console.log(`${user.username} joined main-room`);
      socket.data.user = user;
      socket.join("main-room");
      socket.emit("session:joined", { sessionId: "main-room", user });
      socket.to("main-room").emit("session:user-joined", { username: user.username });
    } catch (err) {
      console.log("Invalid token:", err.message);
      socket.emit("auth:error", { error: "Invalid or expired token" });
      socket.disconnect();
    }
  });

  // Admin selects a song
  socket.on("admin:select-song", ({ songId }) => {
    const user = socket.data.user;
    if (!user || !user.isAdmin) {
      return socket.emit("auth:error", { error: "Admin privileges required" });
    }
    console.log(`🎵 ${user.username} selected song: ${songId}`);
    io.to("main-room").emit("session:song-selected", { songId });
  });

  // Admin ends the session
  socket.on("admin:quit-session", () => {
    const user = socket.data.user;
    if (!user || !user.isAdmin) {
      return socket.emit("auth:error", { error: "Admin privileges required" });
    }
    console.log(`${user.username} ended the session`);
    io.to("main-room").emit("session:ended");
  });

  // Autoscroll controls
  socket.on("session:autoscroll-start", ({ speed = 1 }) => {
    const user = socket.data.user;
    if (!user) {
      return socket.emit("auth:error", { error: "Authentication required" });
    }
    console.log(`${user.username} started autoscroll (speed: ${speed})`);
    io.to("main-room").emit("session:autoscroll", { running: true, speed });
  });

  // Stop autoscroll
  socket.on("session:autoscroll-stop", () => {
    const user = socket.data.user;
    if (!user) {
      return socket.emit("auth:error", { error: "Authentication required" });
    }
    console.log(`${user.username} stopped autoscroll`);
    io.to("main-room").emit("session:autoscroll", { running: false });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const user = socket.data.user;
    if (user) {
      console.log(`${user.username} disconnected`);
      socket.to("main-room").emit("session:user-left", { username: user.username });
    } else {
      console.log("Socket disconnected before auth:", socket.id);
    }
  });
};
