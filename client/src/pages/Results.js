import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

export default function Results() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const query = new URLSearchParams(useLocation().search).get("query") || "";
  const [results, setResults] = useState([]);
  const [socket, setSocket] = useState(null);

  const user = useMemo(() => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  }, [token]);

  // 1️⃣ Fetch songs from backend based on search query
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/main");
      return;
    }

    axios
      .get(`http://localhost:4000/api/songs?query=${encodeURIComponent(query)}`)
      .then((res) => setResults(res.data))
      .catch((err) => console.error("Failed to load songs:", err));
  }, [query, user, navigate]);

  // 2️⃣ Connect to socket
  useEffect(() => {
    if (!token) return;
    const s = io("http://localhost:4000");
    setSocket(s);

    s.on("connect", () => s.emit("join-session", { token }));
    s.on("session:ended", () => navigate("/main"));

    return () => s.disconnect();
  }, [token, navigate]);

  // 3️⃣ Select a song → emit socket event + go to Live page
  const selectSong = (songId) => {
    socket.emit("admin:select-song", { songId });
    navigate(`/live?songId=${songId}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Results for "{query}"</h2>

      {results.length === 0 && <p>No songs found.</p>}

      {results.map((song) => (
        <div
          key={song.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            cursor: "pointer",
          }}
          onClick={() => selectSong(song.id)}
        >
          <h3>{song.title}</h3>
          <p>{song.artist}</p>
        </div>
      ))}
    </div>
  );
}
