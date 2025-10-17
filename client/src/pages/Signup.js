import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [instrument, setInstrument] = useState("");
  const [isOnlyVocal, setIsOnlyVocal] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      // Signup the user
      await axios.post("http://localhost:4000/api/auth/signup", {
        username,
        password,
        instrument,
        isOnlyVocal
      });

      // Immediately login after signup
      const loginRes = await axios.post("http://localhost:4000/api/auth/login", {
        username,
        password
      });

      // Save token and redirect
      localStorage.setItem("token", loginRes.data.token);
      navigate("/main");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Signup</h2>

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

      <div>
        <label>
          <input
            type="checkbox"
            checked={isOnlyVocal}
            onChange={(e) => setIsOnlyVocal(e.target.checked)}
          />
          Are you a singer without instrument?
        </label>
      </div>

      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
}

export default Signup;
