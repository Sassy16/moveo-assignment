import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../App.css";

export default function Main() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [query, setQuery] = useState("");
  const token = localStorage.getItem("token");

  // Get user info from token
  const user = useMemo(() => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  }, [token]);

  // Setup socket connection
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const s = io("http://localhost:4000");
    setSocket(s);

    s.on("connect", () => {
      s.emit("join-session", { token });
    });

    s.on("session:song-selected", ({ songId }) => {
      navigate(`/live?songId=${songId}`);
    });

    s.on("session:ended", () => {
      navigate("/main");
    });

    return () => s.disconnect();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="main-container">
      <header className="main-header">
        <h1>Moveo Band</h1>
        <div>
          <span>Welcome, <strong>{user.username}</strong></span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content">
        {user.isAdmin ? (
          <>
            <h2>Search any song...</h2>
            <div className="search-box">
              <input
                placeholder="Type song name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={() => navigate(`/results?query=${encodeURIComponent(query)}`)}>
                Search
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>🎤 Waiting for next song...</h2>
            <p>You’ll automatically join the live page once a song is selected.</p>
          </>
        )}
      </div>
    </div>
  );
}
