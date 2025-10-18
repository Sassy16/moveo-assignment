import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "../App.css";
import { API_BASE_URL } from "../config";

export default function Live() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const songId = query.get("songId");
  const token = localStorage.getItem("token");

  const user = useMemo(() => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  }, [token]);

  const [song, setSong] = useState(null);
  const [socket, setSocket] = useState(null);
  const [auto, setAuto] = useState({ running: false, speed: 1 });
  const scrollRef = useRef(null);
  const rafRef = useRef();

  // Fetch song data
  useEffect(() => {
    if (!songId) {
      navigate("/main");
      return;
    }

    axios
      .get(`${API_BASE_URL}/api/songs/${songId}`)
      .then((res) => {
        console.log("Fetched song:", res.data);
        setSong(res.data);
      })
      .catch((err) => {
        console.error("Failed to load song:", err);
        navigate("/main");
      });
  }, [songId, navigate]);

  // Setup socket connection
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const s = io(API_BASE_URL);
    setSocket(s);

    s.on("connect", () => {
      s.emit("join-session", { token });
    });

    s.on("session:ended", () => {
      navigate("/main");
    });

    s.on("session:autoscroll", (data) => {
      setAuto(data);
    });

    return () => s.disconnect();
  }, [token, navigate]);

  // Handle autoscroll behavior
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (!auto.running) return;

    const el = scrollRef.current;
    const step = () => {
      if (el) el.scrollTop += auto.speed;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafRef.current);
  }, [auto]);

  // Socket actions
  const startAutoScroll = () => {
    const el = scrollRef.current;
    if (el) el.scrollTop += 1; // Initial nudge
    socket.emit("session:autoscroll-start", { speed: 0.5 });
  };

  const stopAutoScroll = () => {
    socket.emit("session:autoscroll-stop");
  };

  const quitSession = () => {
    socket.emit("admin:quit-session");
  };

  const isHebrew = (text) => /[\u0590-\u05FF]/.test(text);

  return (
    <div className="live-container">
      <header className="live-header">
        <h1>{song?.title}</h1>
        <h2>{song?.artist}</h2>
      </header>

      <div ref={scrollRef} className="lyrics-container">
        {song?.data?.map((line, idx) => (
          <div
            key={idx}
            className={`lyrics-line ${
              isHebrew(line?.[0]?.lyrics || "") ? "rtl" : "ltr"
            }`}
          >
            {line.map((w, i) => (
              <div key={i} className="word-block">
                {!user?.isOnlyVocal && (
                  <span className="chord">{w.chords || ""}</span>
                )}
                <span className="lyric">{w.lyrics}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="floating-controls">
        {!auto.running ? (
          <button onClick={startAutoScroll}>▶ Start Auto Scroll</button>
        ) : (
          <button onClick={stopAutoScroll}>⏸ Stop Auto Scroll</button>
        )}

        {user?.isAdmin && (
          <button className="quit-btn" onClick={quitSession}>
            🚪 Quit
          </button>
        )}
      </div>
    </div>
  );
}
