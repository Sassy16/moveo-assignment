import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

export default function Main() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [query, setQuery] = useState("");
  const token = localStorage.getItem("token");

  const user = useMemo(() => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  }, [token]);

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
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Welcome, {user.username}</h2>
        <button onClick={handleLogout} style={{ background: "#900", color: "#fff", padding: "6px 12px" }}>
          Logout
        </button>
      </div>

      {user.isAdmin ? (
        <>
          <h2>Search any song...</h2>
          <input
            placeholder="Type song name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => navigate(`/results?query=${encodeURIComponent(query)}`)}>
            Search
          </button>
        </>
      ) : (
        <>
          <h2>Waiting for next song...</h2>
          <p>You’ll automatically join the live page once a song is selected.</p>
        </>
      )}
    </div>
  );
}
