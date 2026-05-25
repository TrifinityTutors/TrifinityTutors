import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">Log in to continue your learning journey.</p>

      <Button variant="outline" className="mt-8 w-full h-11 gap-3">
        <GoogleIcon /> Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4">
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
