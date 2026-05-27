/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleGoogleLogin = async (credentialResponse) => {
    setErrors({});
    setLoading(true);

    try {
      if (!credentialResponse?.credential) {
        throw new Error("Google authentication failed.");
      }

      const response = await fetch("http://localhost:5000/api/students/google-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Google login failed. Please try again.");
      }

      localStorage.setItem("token", data.token || `google-${Date.now()}`);
      localStorage.setItem("user", JSON.stringify({
        name: data.user?.name || "",
        email: data.user?.email || "",
        role: "student",
        googleId: data.user?.googleId || "",
      }));
      navigate("/student-dashboard");
    } catch (error) {
      setErrors({ submit: error.message || "Google login failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">Log in to continue your learning journey.</p>

      <div className="mt-8 w-full">
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setErrors({ submit: "Google authentication failed. Please try again." })}
          render={(renderProps) => (
            <button
              type="button"
              onClick={renderProps.onClick}
              disabled={renderProps.disabled || loading}
              className="w-full h-11 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-slate-900 transition hover:border-slate-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <GoogleIcon />
              {loading ? "Signing in..." : "Continue with Google"}
            </button>
          )}
        />
      </div>

      {errors.submit && <p className="mt-3 text-sm text-red-600 font-medium">{errors.submit}</p>}

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input name="email" autoComplete="email" className="mt-2 h-11" placeholder="you@email.com" type="email" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label>Password</Label>
            <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
          </div>
          <Input name="password" autoComplete="current-password" className="mt-2 h-11" placeholder="••••••••" type="password" />
        </div>
        <Button asChild className="w-full h-11 bg-gradient-primary shadow-glow">
          <Link to="/dashboard/student">Log in</Link>
        </Button>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h5.9a5.05 5.05 0 0 1-2.19 3.31v2.75h3.54c2.08-1.91 3.25-4.74 3.25-8.3z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.68l-3.54-2.75c-.98.66-2.24 1.05-3.74 1.05-2.87 0-5.3-1.94-6.17-4.55H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.83 14.07a6.6 6.6 0 0 1 0-4.14V7.09H2.18a11 11 0 0 0 0 9.82l3.65-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.15-3.15C17.45 2.16 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.09l3.65 2.84C6.7 7.32 9.13 5.38 12 5.38z"/>
    </svg>
  );
}
export default LoginPage;