import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminLogin.css"

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const text = await res.text();
        console.log("Server Error:", text);
        alert("Login failed. Please check your credentials.");
        return;
      }

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/admin/dashboard", { replace: true });
      } else {
        alert("Login failed");
      }

    } catch (err) {
      console.error("Fetch error:", err);
      alert("Server not reachable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <h1>Admin Portal</h1>
          <p className="subtitle">Sign in to your admin account</p>
        </div>

        <div className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <button 
            onClick={handleLogin} 
            disabled={isLoading}
            className="login-btn"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
