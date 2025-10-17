import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

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

  // Fetch song JSON from backend
  useEffect(() => {
    if (!songId) {
      navigate("/main");
      return;
    }

    axios
      .get(`http://localhost:4000/api/songs/${songId}`)
      .then((res) => setSong(res.data))
      .catch(() => navigate("/main"));
  }, [songId, navigate]);

  // 2️⃣ Connect to socket and listen for events
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

    s.on("session:ended", () => {
      navigate("/main");
    });

    s.on("session:autoscroll", (data) => {
      setAuto(data);
    });

    return () => s.disconnect();
  }, [token, navigate]);

  // 3️⃣ Handle autoscroll behavior
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

  // 4️⃣ Socket actions
  const startAutoScroll = () => {
    socket.emit("session:autoscroll-start", { speed: 0.7 });
  };

  const stopAutoScroll = () => {
    socket.emit("session:autoscroll-stop");
  };

  const quitSession = () => {
    socket.emit("admin:quit-session");
  };

  const isHebrew = (text) => /[\u0590-\u05FF]/.test(text);

  return (
    <div
      style={{
        padding: "20px",
        background: "#000",
        color: "#fff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "32px", margin: 0 }}>{song?.title}</h1>
        <h2 style={{ fontSize: "20px", opacity: 0.7 }}>{song?.artist}</h2>
      </header>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          fontSize: "24px",
          lineHeight: 1.7,
          padding: "10px",
        }}
      >
        {song?.data?.map((line, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              direction: isHebrew(line?.[0]?.lyrics || "") ? "rtl" : "ltr",
            }}
          >
            {line.map((w, i) => (
  <div
    key={i}
    style={{
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      minWidth: "3ch", 
      textAlign: "center",
    }}
  >
    {!user?.isOnlyVocal && (
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "0.9em",
          height: "1.2em", 
        }}
      >
        {w.chords || ""} 
      </span>
    )}
    <span>{w.lyrics}</span>
  </div>
))}

          </div>
        ))}
      </div>

      <div
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          display: "flex",
          gap: "10px",
        }}
      >
        {!auto.running ? (
          <button onClick={startAutoScroll}>Start Auto Scroll</button>
        ) : (
          <button onClick={stopAutoScroll}>Stop Auto Scroll</button>
        )}

        {user?.isAdmin && (
          <button
            onClick={quitSession}
            style={{ background: "#900", color: "#fff" }}
          >
            Quit
          </button>
        )}
      </div>
    </div>
  );
}
