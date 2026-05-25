import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/student-dashboard");
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      // Try tutor login first
      const tutorResponse = await fetch("http://localhost:5000/api/tutors/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      
      const tutorData = await tutorResponse.json();
      
      if (tutorData.success) {
        localStorage.setItem("token", tutorData.token);
        localStorage.setItem("tutor", JSON.stringify(tutorData.user));
        
        if (!tutorData.isProfileComplete) {
          window.location.href = "/register-tutor";
        } else if (tutorData.status === "approved") {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        // If not a tutor, try student login
        alert("Account not found. Please sign up first.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google login failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8">
        <h1 className="font-display text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Log in to continue your learning journey.</p>

        <div className="mt-8 w-full flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => alert("Google login failed")}
            theme="outline"
            size="large"
            width="100%"
          />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <Label>Email</Label>
            <Input className="mt-2 h-11" placeholder="you@email.com" type="email" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>Password</Label>
              <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
            </div>
            <Input className="mt-2 h-11" placeholder="••••••••" type="password" />
          </div>
          <Button type="submit" className="w-full h-11 bg-gradient-primary shadow-glow">
            Log in
          </Button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
