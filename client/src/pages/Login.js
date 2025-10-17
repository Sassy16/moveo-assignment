import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      alert("Login successful");
      navigate("/main");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "400px",
        margin: "50px auto",
        textAlign: "center",
        background: "#f5f5f5",
        borderRadius: "8px",
      }}
    >
      <h2>Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: "15px", padding: "8px" }}
      />

      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: "10px",
          background: "#333",
          color: "#fff",
          border: "none",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        Login
      </button>

      <hr />

      <h3>Don't have an account?</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button
          onClick={() => navigate("/signup")}
          style={{
            padding: "10px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Sign Up as User
        </button>

        <button
          onClick={() => navigate("/admin-signup")}
          style={{
            padding: "10px",
            background: "#ff5722",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Sign Up as Admin
        </button>
      </div>
    </div>
  );
}

export default Login;
