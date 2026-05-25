import { Link, useLocation } from "react-router-dom";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-md transition-transform group-hover:scale-105">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">
              Trifinity<span className="text-blue-600"> Tutors</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 ${
                  path === l.to ? "text-gray-900 bg-gray-50" : "text-gray-600"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="default" asChild>
              <Link to="/auth/login">Log in</Link>
            </Button>
            <Button size="default" asChild>
              <Link to="/auth/signup">Get Started</Link>
            </Button>
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
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
