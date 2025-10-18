import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "../App.css";
import { API_BASE_URL } from "../config";

export default function Results() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const query = new URLSearchParams(useLocation().search).get("query") || "";
  const [results, setResults] = useState([]);
  const [socket, setSocket] = useState(null);

  // Get user info from token
  const user = useMemo(() => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/main");
      return;
    }

    axios
      .get(`${API_BASE_URL}/api/songs?query=${encodeURIComponent(query)}`)
      .then((res) => setResults(res.data))
      .catch((err) => console.error("Failed to load songs:", err));
  }, [query, user, navigate]);

  // Setup socket connection
  useEffect(() => {
    if (!token) return;
    const s = io(API_BASE_URL);
    setSocket(s);

    s.on("connect", () => s.emit("join-session", { token }));
    s.on("session:ended", () => navigate("/main"));

    return () => s.disconnect();
  }, [token, navigate]);

  const selectSong = (songId) => {
    socket.emit("admin:select-song", { songId });
    navigate(`/live?songId=${songId}`);
  };

  return (
    <div className="results-container">
      <h2>Results for "<span className="highlight">{query}</span>"</h2>

      {results.length === 0 && (
        <p className="no-results">No songs found. Try a different query.</p>
      )}

      <div className="results-grid">
        {results.map((song) => (
          <div
            key={song.id}
            className="song-card"
            onClick={() => selectSong(song.id)}
          >
            {song.image ? (
              <img src={song.image} alt={song.title} className="song-image" />
            ) : (
              <div className="song-placeholder">🎵</div>
            )}
            <div className="song-info">
              <h3>{song.title}</h3>
              <p>{song.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
