import { Link, useLocation } from "react-router-dom";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { ProfileDropdown } from "@/components/ProfileDropdown";

const links = [
  { to: "/tutors", label: "Find Tutors" },
  { to: "/register-tutor", label: "Become a Tutor" },
  { to: "/auth/login", label: "Student" },
  { to: "/tutor-login", label: "Tutor" },
  { to: "/admin-login", label: "Admin" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur shadow-sm border-b border-slate-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg transition-transform hover:scale-105">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="text-sm font-semibold tracking-tight text-slate-900">
            Trifinity <span className="block text-blue-600">Tutors</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors ${
                path === l.to ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!user ? (
            <>
              <Link
                to="/auth/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Log in
              </Link>
              <Button asChild className="rounded-full px-5 py-2.5">
                <Link to="/auth/signup">Get Started</Link>
              </Button>
            </>
          ) : (
            <ProfileDropdown tutorData={user} onLogout={logout} />
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden rounded-lg p-2 hover:bg-gray-100"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
          <div className="md:hidden border-t border-gray-200 px-4 py-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 text-gray-700"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <>
                  <Link to="/tutor-profile" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 text-gray-700">
                    Profile
                  </Link>
                  <button onClick={() => { logout(); setOpen(false); }} className="block rounded-lg px-3 py-2 text-sm font-medium text-red-600">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="default" asChild>
                    <Link to="/auth/login" onClick={() => setOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button size="default" asChild>
                    <Link to="/auth/signup" onClick={() => setOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
    </header>
  );
}

export default Navbar;
