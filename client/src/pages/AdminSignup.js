import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { API_BASE_URL } from "../config";

function AdminSignup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [instrument, setInstrument] = useState("");
  const [isOnlyVocal, setIsOnlyVocal] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      // Signup as admin
      await axios.post(`${API_BASE_URL}/api/auth/admin-signup`, {
        username,
        password,
        instrument,
        isOnlyVocal
      });

      // Immediately login after signup
      const loginRes = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username,
        password
      });

      // Save token and redirect
      localStorage.setItem("token", loginRes.data.token);
      navigate("/main");
    } catch (err) {
      alert(err.response?.data?.error || "Admin signup failed");
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <h2>Admin Signup</h2>

      <input
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        placeholder="Instrument"
        value={instrument}
        onChange={(e) => setInstrument(e.target.value)}
      />

      <div className="toggle-group">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={isOnlyVocal}
            onChange={(e) => setIsOnlyVocal(e.target.checked)}
          />
          <span className="slider"></span>
        </label>
        <span className="toggle-text">I'm a singer without an instrument</span>
      </div>

      <button onClick={handleSignup}>Sign Up as Admin</button>
    </div>
  );
}

export default AdminSignup;
