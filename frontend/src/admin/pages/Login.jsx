import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

 const handleLogin = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    // 🔴 HANDLE SERVER ERROR
    if (!res.ok) {
      const text = await res.text();
      console.log("Server Error:", text);
      alert("Backend error — check console");
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
    alert("Server not reachable");
  }
};

  return (
    <div>
      <h2>Admin Login</h2>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <br />

      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
