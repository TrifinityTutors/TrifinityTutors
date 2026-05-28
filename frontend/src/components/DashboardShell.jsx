import React, { useEffect, useState, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { GraduationCap, Bell, Search } from "lucide-react";
import { io as ioClient } from "socket.io-client";
import { Toaster, toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProfileDropdown } from "@/components/ProfileDropdown";

export function DashboardShell({ children, navItems, title, role }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
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

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Socket.IO for real-time notifications
  const socketRef = useRef(null);
  useEffect(() => {
    const initSocket = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const endpoint = import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin;
        socketRef.current = ioClient(endpoint, { transports: ['websocket'] });

        const userId = currentUser?._id || currentUser?.id || currentUser?.userId;
        if (userId) {
          socketRef.current.on('connect', () => {
            socketRef.current.emit('join', userId);
          });
        }

        socketRef.current.on('booking_confirmed', async (payload) => {
          try {
            toast(`${payload?.tutorName || 'Tutor'}: booking confirmed for ${payload?.date || ''} ${payload?.time || ''}`);
          } catch (e) {}
          setUnreadCount((c) => (typeof c === 'number' ? c + 1 : 1));
          try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) return;
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
          } catch (e) {}
        });

        socketRef.current.on('new_booking', async (payload) => {
          try {
            toast(`New booking: ${payload?.studentName || payload?.tutorName || 'Booking'} on ${payload?.date || ''} ${payload?.time || ''}`);
          } catch (e) {}
          setUnreadCount((c) => (typeof c === 'number' ? c + 1 : 1));
          try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) return;
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
          } catch (e) {}
        });

        socketRef.current.on('booking_updated', async (payload) => {
          try {
            toast(`Session ${payload?.action || 'updated'}: ${payload?.date || ''} ${payload?.time || ''}`);
          } catch (e) {}
          setUnreadCount((c) => (typeof c === 'number' ? c + 1 : 1));
          try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) return;
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
          } catch (e) {}
        });

        socketRef.current.on('notification', async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) return;
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
          } catch (e) {}
        });
      } catch (e) {
        // ignore socket errors
      }
    };

    initSocket();

    return () => {
      try { socketRef.current?.disconnect(); } catch (e) {}
    };
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
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
                    key={`${n.label}-${n.to}`}
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
                <div className="relative">
                  <Button variant="ghost" size="icon" className="relative" onClick={async () => {
                    try {
                      // toggle panel
                      setShowNotifications((s) => !s);
                      const token = localStorage.getItem('token');
                      if (!token) return;
                      const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
                      if (!res.ok) return;
                      const data = await res.json();
                      setUnreadCount(data.unreadCount || 0);
                      setNotifications(data.notifications || []);
                    } catch (e) {
                      // ignore
                    }
                  }}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-5 h-5">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                  </Button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg z-50">
                      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                        <div className="text-sm font-semibold">Notifications</div>
                        <button className="text-xs text-slate-500" onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch('/api/notifications/mark-all-read', { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
                            if (res.ok) {
                              setNotifications((n) => n.map(x => ({ ...x, isRead: true })));
                              setUnreadCount(0);
                            }
                          } catch (e) {}
                        }}>Mark all read</button>
                      </div>
                      <div>
                        {notifications.length === 0 ? (
                          <div className="p-4 text-sm text-slate-500">No notifications</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n._id} className={`p-3 border-b border-gray-50 ${n.isRead ? 'bg-white' : 'bg-slate-50'}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-slate-900 truncate">{n.title}</div>
                                  <div className="mt-1 text-xs text-slate-500 truncate">{n.message}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</div>
                                </div>
                              </div>
                              <div className="mt-2 flex gap-2">
                                {!n.isRead && (
                                  <button className="text-xs text-blue-600" onClick={async () => {
                                    try {
                                      const token = localStorage.getItem('token');
                                      const res = await fetch(`/api/notifications/${n._id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
                                      if (!res.ok) throw new Error('Failed');
                                      const data = await res.json();
                                      setNotifications((prev) => prev.map(x => x._id === n._id ? data.notification : x));
                                      setUnreadCount(data.unreadCount || 0);
                                    } catch (e) {
                                      // ignore
                                    }
                                  }}>Mark as read</button>
                                )}
                                <button className="text-xs text-slate-500" onClick={() => {
                                  // optional: navigate to booking or details
                                  if (n.meta?.bookingId) {
                                    setShowNotifications(false);
                                    navigate(`/dashboard/student/bookings`);
                                  }
                                }}>View</button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
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
