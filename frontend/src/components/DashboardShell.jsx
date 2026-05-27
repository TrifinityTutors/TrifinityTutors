import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { GraduationCap, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProfileDropdown } from "@/components/ProfileDropdown";

export function DashboardShell({ children, navItems, title, role }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const currentUser = user || React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("student")) || JSON.parse(localStorage.getItem("tutor")) || {};
    } catch {
      return {};
    }
  }, []);

  const userName = currentUser?.name || currentUser?.fullName || "";
  const effectiveRole = currentUser?.role ? `${currentUser.role.charAt(0).toUpperCase()}${currentUser.role.slice(1)}` : role || "";
  const greeting = `Welcome back${userName ? `, ${userName}` : ""}`;

  const handleLogout = () => {
    logout();
  };

  const handleProfileLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white h-screen sticky top-0">
          <Link to="/" className="flex items-center gap-2 px-6 h-16 border-b border-gray-200">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg">Trifinity</span>
          </Link>
          <div className="flex-1 overflow-y-auto p-3">
            <p className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500">{role}</p>
            <nav className="space-y-1">
              {navItems.map(n => {
                const active = n.activeWhen ? location.pathname === n.activeWhen : location.pathname === n.to;
                const itemClass = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`;

                if (n.stayOnDashboard) {
                  return (
                    <button
                      key={`${n.label}-${n.to}`}
                      type="button"
                      onClick={() => navigate(n.to)}
                      className={itemClass}
                    >
                      <n.icon className="h-4 w-4" />
                      {n.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={itemClass}
                  >
                    <n.icon className="h-4 w-4" />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <ProfileDropdown userData={currentUser} onLogout={handleProfileLogout} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{userName}</div>
                <div className="text-xs text-gray-500 truncate">{effectiveRole}</div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
            <div className="flex h-20 flex-col justify-center gap-3 px-4 sm:px-8">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold flex-1 truncate text-gray-900">{title}</h1>
                <div className="hidden md:flex items-center gap-2 w-72 px-3 rounded-xl bg-gray-100">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-10" placeholder="Search..." />
                </div>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
                </Button>
                <ProfileDropdown userData={currentUser} onLogout={handleLogout} />
              </div>
              <p className="text-sm text-gray-600">{greeting}</p>
            </div>
          </header>
          <main className="p-4 sm:p-8 max-w-7xl">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, delta, icon: Icon, accent = "primary" }) {
  const colors = {
    primary: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {delta && <p className="mt-1 text-xs text-green-600 font-medium">{delta}</p>}
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${colors[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
