import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

function TutorLogin() {

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/tutor-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    alert(data.message);

    if (data.message === "Login successful") {
      localStorage.setItem("token", data.token);
      localStorage.setItem("tutor", JSON.stringify(data.user)); 
      window.location.href = "/tutor-dashboard";
    }
  };

  // 🔥 GOOGLE LOGIN HANDLER
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:5000/api/tutors/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: credentialResponse.credential
        })
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Login failed");
        return;
      }

      // store token
      localStorage.setItem("token", data.token);

      // 🔥 redirect logic
      if (!data.isProfileComplete) {
        window.location.href = "/tutor-register";
      } else if (data.status !== "approved") {
        alert("Your account is under review");
      } else {
        window.location.href = "/tutor-dashboard";
      }

    } catch (err) {
      console.log(err);
      alert("Google login failed");
    }
  };

  return (
    <div>

      <h2>Tutor Login</h2>

      {/* 🔹 Normal Login */}
      <form onSubmit={handleSubmit}>

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="password"
          placeholder="Password"
          type="password"
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit">Login</button>

      </form>

      <br /><br />

      <hr />

      <p style={{ textAlign: "center" }}>OR</p>

      {/* 🔥 GOOGLE LOGIN BUTTON */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.log("Google Login Failed")}
        />
      </div>

    </div>
  );
}

export default TutorLogin;