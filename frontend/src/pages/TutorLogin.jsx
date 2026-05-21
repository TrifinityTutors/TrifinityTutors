import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import "./TutorLogin.css"

function TutorLogin() {

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/students/tutor-login", {
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
        window.location.href = "/dashboard";
      }
    } catch (error) {
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
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

      console.log("🔐 Google OAuth Response:", {
        success: data.success,
        user: data.user?._id ? { id: data.user._id, name: data.user.name, email: data.user.email } : null,
        isProfileComplete: data.isProfileComplete,
        status: data.status
      });

      if (!data.success) {
        alert(data.message || "Login failed");
        return;
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("tutor", JSON.stringify(data.user));

      console.log("✅ Stored in localStorage:", {
        tutorId: data.user._id,
        email: data.user.email,
        isProfileComplete: data.isProfileComplete
      });

      // 🔥 Redirect logic based on profile completion
      if (!data.isProfileComplete) {
        // NEW USER - Show registration page
        console.log("→ Redirecting to tutor registration (profile not complete)");
        window.location.href = "/tutor-register";
      } else if (data.status === "rejected") {
        // ACCOUNT REJECTED
        alert("Your account has been rejected. Please contact support.");
      } else if (data.status === "pending") {
        // EXISTING USER - PENDING APPROVAL
        alert("Your account is under review. Please wait for approval.");
        window.location.href = "/dashboard";
      } else if (data.status === "approved") {
        // EXISTING USER - APPROVED
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.log(err);
      alert("Google login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <h1>Tutor Login</h1>
          <p className="subtitle">Welcome back! Sign in to your account</p>
        </div>

        {/* 🔹 Normal Login */}
        <form onSubmit={handleSubmit} className="login-form">

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              placeholder="Enter your password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        {/* 🔥 GOOGLE LOGIN BUTTON */}
        <div className="google-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log("Google Login Failed")}
          />
        </div>

        <div className="footer-link">
          <p>Don't have an account? <a href="/tutor-register">Register here</a></p>
        </div>

      </div>
    </div>
  );
}

export default TutorLogin;