/* eslint-disable react-refresh/only-export-components */
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GraduationCap, Users, Check } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, dashboardPathFor } from "@/lib/auth";
import { toast, Toaster } from "sonner";

function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrors({});
    setLoading(true);

    try {
      if (!credentialResponse?.credential) {
        throw new Error("Google authentication failed.");
      }

      const endpoint =
        role === "tutor"
          ? "/api/tutors/google-login"
          : "/api/students/google-login";

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Google login failed. Please try again."
        );
      }

      const authUser = {
        _id: data.user?._id || data.user?.id,
        id: data.user?.id || data.user?._id,
        name: data.user?.name || "",
        email: data.user?.email || "",
        role,
        googleId: data.user?.googleId || "",
        photo: data.user?.photo || data.user?.profilePhoto || "",
        profileComplete:
          data.isProfileComplete ?? data.user?.profileComplete,
        status: data.status || data.user?.status,
      };

      setSession(data.token, authUser);

      if (rememberMe) {
        localStorage.setItem("rememberEmail", data.user?.email);
      }

      toast.success("Login successful!");

      navigate(dashboardPathFor(role), {
        replace: true,
      });
    } catch (error) {
      const message =
        error.message || "Google login failed. Please try again.";

      setErrors({
        submit: message,
      });

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    setErrors({});
    setLoading(true);

    try {
      if (!form.email || !form.password) {
        throw new Error("Email and password are required.");
      }

      const endpoint =
        role === "tutor"
          ? "/api/tutors/email-login"
          : "/api/students/email-login";

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      const authUser = {
        _id: data.user?._id || data.user?.id,
        id: data.user?.id || data.user?._id,
        name: data.user?.name || "",
        email: data.user?.email || "",
        role,
        photo: data.user?.photo || data.user?.profilePhoto || "",
        profileComplete:
          data.isProfileComplete ?? data.user?.profileComplete,
        status: data.status || data.user?.status,
      };

      setSession(data.token, authUser);

      if (rememberMe) {
        localStorage.setItem("rememberEmail", form.email);
      }

      toast.success("Login successful!");

      navigate(dashboardPathFor(role), {
        replace: true,
      });
    } catch (error) {
      const message = error.message || "Login failed. Please try again.";

      setErrors({
        submit: message,
      });

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrors({});
    setForm({
      email: "",
      password: "",
    });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">
        Welcome back
      </h1>

      <p className="mt-2 text-muted-foreground">
        Sign in to continue your learning journey
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {[
          {
            id: "student",
            icon: GraduationCap,
            title: "I'm a Student",
            desc: "Find tutors",
          },
          {
            id: "tutor",
            icon: Users,
            title: "I'm a Tutor",
            desc: "Teach & earn",
          },
        ].map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => handleRoleChange(r.id)}
            className={`relative rounded-2xl border-2 p-4 text-left transition-all ${
              role === r.id
                ? "border-primary bg-primary/5 shadow-glow"
                : "border-border hover:border-primary/40"
            }`}
          >
            {role === r.id && (
              <div className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-gradient-primary text-primary-foreground">
                <Check className="h-3 w-3" />
              </div>
            )}

            <div
              className={`grid h-10 w-10 place-items-center rounded-xl ${
                role === r.id
                  ? "bg-gradient-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <r.icon className="h-5 w-5" />
            </div>

            <div className="mt-3 font-semibold">{r.title}</div>

            <div className="text-xs text-muted-foreground">
              {r.desc}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            const message =
              "Google authentication failed. Please try again.";

            setErrors({
              submit: message,
            });

            toast.error(message);
          }}
        />
      </div>

      {errors.submit && (
        <p className="mt-3 text-sm text-red-600 font-medium">
          {errors.submit}
        </p>
      )}

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        OR
        <div className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4" onSubmit={handleEmailLogin}>
        <div>
          <Label>Email</Label>
          <Input
            name="email"
            type="email"
            autoComplete="email"
            className="mt-2 h-11"
            placeholder="you@email.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Password</Label>
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            className="mt-2 h-11"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />

            <span className="text-xs text-muted-foreground">
              Remember me
            </span>
          </label>

          <Link
            to="/forgot-password"
            className="text-xs text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-gradient-primary shadow-glow"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-4 text-xs text-muted-foreground text-center">
        Don't have an account?{" "}
        <Link
          to="/auth/signup"
          className="font-semibold text-primary hover:underline"
        >
          Create one
        </Link>
      </p>

      <Toaster position="top-right" />
    </div>
  );
}

export default LoginPage;