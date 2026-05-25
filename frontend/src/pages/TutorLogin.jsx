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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="login-wrapper max-w-md w-full relative">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="login-header text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-2xl font-bold">T</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutor Login</h1>
            <p className="subtitle text-gray-600">Welcome back! Sign in to your account</p>
          </div>

          {/* 🔹 Normal Login */}
          <form onSubmit={handleSubmit} className="login-form space-y-5 mb-8">

            <div className="form-group">
              <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:border-gray-400"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-2">Password</label>
              <input
                id="password"
                name="password"
                placeholder="Enter your password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:border-gray-400"
              />
            </div>

            <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold text-sm inline-block">
              Forgot password?
            </a>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
            >
              {isLoading ? "🔄 Logging in..." : "✅ Login"}
            </button>

          </form>

          <div className="divider flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-600 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* 🔥 GOOGLE LOGIN BUTTON */}
          <div className="google-login-container mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log("Google Login Failed")}
            />
          </div>

          <div className="footer-link text-center">
            <p className="text-gray-600">Don't have an account? <a href="/tutor-register" className="text-blue-600 hover:text-blue-700 font-bold">Register here</a></p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: "🎯", text: "Easy Signup" },
            { icon: "💰", text: "Earn Money" },
            { icon: "⭐", text: "Help Students" }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="text-xs font-bold text-gray-900">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TutorLogin;