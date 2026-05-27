import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GraduationCap, Users, Check } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { verifyTutorProfileAndDecide } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

function SignupPage() {
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

  const roles = [
    { id: "student", icon: GraduationCap, title: "I'm a Student", desc: "Find tutors" },
    { id: "tutor", icon: Users, title: "I'm a Tutor", desc: "Teach & earn" },
  ];

  const handleSignup = (e) => {
    e.preventDefault();
    if (role === "tutor") {
      navigate("/register-tutor");
    } else {
      navigate("/dashboard/student");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log("Google signup initiated for role:", role);
      
      if (role === "tutor") {
        // Tutor registration with Google
        const response = await fetch("http://localhost:5000/api/tutors/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: credentialResponse.credential })
        });
        
        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem("token", data.token);
          await verifyTutorProfileAndDecide(data.user, data.token, navigate);
        } else {
          alert(data.message || "Google signup failed");
        }
      } else {
        // Student registration - redirect to student register
        const response = await fetch("http://localhost:5000/api/students/google-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: credentialResponse.credential })
        });
        
        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem("student", JSON.stringify(data.user));
          // Set a temporary token for student access
          localStorage.setItem("token", data.token || `student_${Date.now()}`);
          navigate("/dashboard/student");
        } else {
          // If endpoint doesn't exist, just navigate to student dashboard
          navigate("/dashboard/student");
        }
      }
    } catch (error) {
      console.error("Google signup error:", error);
      alert("Google signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-2 text-gray-600">Get started in less than a minute.</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {roles.map(r => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`relative rounded-2xl border-2 p-4 text-left transition-all ${
                role === r.id
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              {role === r.id && (
                <div className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl ${
                  role === r.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                <r.icon className="h-5 w-5" />
              </div>
              <div className="mt-3 font-semibold text-gray-900">{r.title}</div>
              <div className="text-xs text-gray-600">{r.desc}</div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google signup failed")}
            theme="outline"
            size="large"
          />
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-gray-500">
          <div className="h-px flex-1 bg-gray-300" /> OR <div className="h-px flex-1 bg-gray-300" />
        </div>

        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <label className="block text-sm font-medium text-gray-900">Full name</label>
            <Input className="mt-2 h-11" placeholder="Ananya Rao" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Email</label>
            <Input className="mt-2 h-11" placeholder="you@email.com" type="email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Password</label>
            <Input name="password" autoComplete="new-password" className="mt-2 h-11" placeholder="At least 8 characters" type="password" />
          </div>
          <button
            type="submit"
            className="w-full h-11 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create account
          </button>
          <p className="text-xs text-gray-600 text-center">
            By creating an account, you agree to our <a className="underline hover:text-blue-600" href="#">Terms</a> and <a className="underline hover:text-blue-600" href="#">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
  );
}

// export default SignupPage;
