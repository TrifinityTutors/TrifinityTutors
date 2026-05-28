import { createFileRoute } from "@tanstack/react-router";
import { Link, Outlet, useLocation } from "react-router-dom";
import { GraduationCap, ArrowLeft } from "lucide-react";
import homeUIImage from "@/assets/homeUI.png";

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const location = useLocation();
  const isLogin = location.pathname.includes("login");
  return (
    <div className="min-h-screen bg-gradient-mesh grid lg:grid-cols-2">
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-primary text-primary-foreground p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur"><GraduationCap className="h-5 w-5" /></div>
          <span className="font-display text-lg font-bold">Trifinity Tutors</span>
        </Link>
        
        <div className="relative z-20 flex flex-col justify-center">
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-4xl font-bold leading-tight">Learn from the best, on your schedule.</h2>
              <p className="mt-4 text-primary-foreground/85 max-w-md">
                Join 50,000+ students and tutors building skills, growing careers, and unlocking potential together.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {["from-rose-300 to-pink-400","from-emerald-300 to-teal-400","from-amber-300 to-orange-400","from-violet-300 to-purple-400"].map((g,i)=>(
                  <div key={i} className={`h-10 w-10 rounded-full bg-gradient-to-br ${g} ring-2 ring-primary`} />
                ))}
              </div>
              <div className="text-sm text-primary-foreground/85">Trusted by 50k+ learners worldwide</div>
            </div>
          </div>
          
          <div className="mt-12 flex justify-center">
            <div className="w-full max-w-xs backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/20 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <img 
                src={homeUIImage} 
                alt="Educational community illustration" 
                className="w-full h-auto object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
        
        <div className="text-xs text-primary-foreground/70">© Trifinity Tutors</div>
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-10 -left-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
      </div>
      <div className="flex flex-col p-6 sm:p-12">
        <div className="flex justify-between items-center lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><GraduationCap className="h-5 w-5" /></div>
            <span className="font-display font-bold">Trifinity</span>
          </Link>
        </div>
        <Link to="/" className="hidden lg:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-md">
            <Outlet />
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {isLogin ? "New to Trifinity? " : "Already have an account? "}
              <Link to={isLogin ? "/auth/signup" : "/auth/login"} className="font-semibold text-primary hover:underline">
                {isLogin ? "Create an account" : "Log in"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AuthLayout