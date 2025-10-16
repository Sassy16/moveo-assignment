const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

module.exports = (io, socket) => {
  socket.on("join-session", ({ sessionId, token }) => {
    try {
      const user = jwt.verify(token, JWT_SECRET);
      console.log(`${user.username} joined session ${sessionId}`);

      socket.data.user = user;
      socket.join(sessionId);

      socket.emit("session:joined", { sessionId, user });
    } catch (err) {
      console.log("Invalid token", err.message);
      socket.emit("auth:error", { error: "Invalid or expired token" });
      socket.disconnect();
    }
  });

  socket.on("admin:select-song", ({ sessionId, songId }) => {
    const user = socket.data.user;
    if (!user || !user.isAdmin) {
      return socket.emit("auth:error", { error: "Admin privileges required" });
    }
    console.log(`${user.username} selected this song: ${songId}`);
    io.to(sessionId).emit("session:song-selected", { songId });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
};
