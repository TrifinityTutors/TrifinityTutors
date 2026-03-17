import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email === "admin" && password === "123456") {
      localStorage.setItem("admin", "true");
      navigate("/admin/dashboard", { replace: true });
    } else {
      alert("Invalid login");
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
