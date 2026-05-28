import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { io as ioClient } from "socket.io-client";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, Search, Heart, Calendar, Bell, MessageCircle, Settings, BookOpen, Star, Clock } from "lucide-react";
import { DashboardShell, StatCard } from "@/components/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SessionCalendar from "@/components/SessionCalendar";

const nav = [
  { to: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
  { to: "/tutors", label: "Find Tutors", icon: Search },
  { to: "/dashboard/student", label: "Saved Tutors", icon: Heart },
  { to: "/dashboard/student/bookings", label: "Bookings", icon: Calendar },
  { to: "/dashboard/student", label: "Messages", icon: MessageCircle },
  { to: "/dashboard/student", label: "Notifications", icon: Bell },
  { to: "/dashboard/student", label: "Settings", icon: Settings },
];

function StudentDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [savedTutors, setSavedTutors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingError, setBookingError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(true);
  const socketRef = useRef(null);

  const loadBookings = useCallback(async () => {
    const authToken = token || localStorage.getItem("token");
    if (!authToken) {
      setBookingError("Missing authorization token");
      setBookingLoading(false);
      return;
    }

    try {
      setBookingLoading(true);
      const res = await fetch("/api/bookings/student", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to load bookings");
      }
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
      setBookingError(null);
    } catch (err) {
      setBookingError(err.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setBookingLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth/login");
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadSavedTutors = async () => {
      if (user?.savedTutors?.length) {
        setSavedTutors(user.savedTutors.map((tutor) => ({
          id: tutor._id || tutor.id,
          name: tutor.name || "Tutor",
          subject: tutor.subject || "Tutoring",
          rating: tutor.rating || 0,
          price: tutor.hourlyRate || tutor.price || 0,
          profilePhoto: tutor.profilePhoto || tutor.photo || "",
        })));
        return;
      }

      if (!token) {
        setSavedTutors([]);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/students/saved-tutors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setSavedTutors((data.savedTutors || []).map((tutor) => ({
          id: tutor._id || tutor.id,
          name: tutor.name || "Tutor",
          subject: tutor.subject || "Tutoring",
          rating: tutor.rating || 0,
          price: tutor.hourlyRate || tutor.price || 0,
          profilePhoto: tutor.profilePhoto || tutor.photo || "",
        })));
      } catch (err) {
        console.error("Error loading saved tutors:", err);
      }
    };

    loadSavedTutors();
  }, [user, token]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    const endpoint = import.meta.env.DEV ? "http://localhost:5000" : window.location.origin;
    const socket = ioClient(endpoint, { transports: ["websocket"] });
    socketRef.current = socket;

    const userObj = JSON.parse(localStorage.getItem("user") || "{}") || {};
    const userId = userObj._id || userObj.id || userObj.userId;
    if (userId) {
      socket.on("connect", () => socket.emit("join", userId.toString()));
    }

    const refreshBookings = () => loadBookings();
    socket.on("new_booking", refreshBookings);
    socket.on("booking_updated", refreshBookings);
    socket.on("booking_confirmed", refreshBookings);
    socket.on("notification", refreshBookings);

    return () => {
      socket.off("new_booking", refreshBookings);
      socket.off("booking_updated", refreshBookings);
      socket.off("booking_confirmed", refreshBookings);
      socket.off("notification", refreshBookings);
      socket.disconnect();
    };
  }, [loadBookings]);

  const userName = user?.name || "Student";

  return (
    <DashboardShell navItems={nav} title={`Welcome back, ${userName} 👋`} role="Student">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active sessions" value="3" delta="+1 this week" icon={BookOpen} />
        <StatCard label="Saved tutors" value={String(savedTutors.length)} icon={Heart} accent="success" />
        <StatCard label="Hours learned" value="48" delta="+6 this month" icon={Clock} accent="warning" />
        <StatCard label="Average rating" value="4.9" icon={Star} />
      </div>

      <div className="mt-8">
        <Card className="p-6 border-border/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-[0.18em]">Session Calendar</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">All your bookings, updated live.</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadBookings}>Refresh</Button>
            </div>
          </div>
          {bookingLoading ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">Loading sessions…</div>
          ) : (
            <SessionCalendar bookings={bookings} role="Student" />
          )}
          {bookingError && (
            <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{bookingError}</div>
          )}
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 border-border/60">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold">Recent bookings</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/student/bookings")}>
              View all
            </Button>
          </div>
          <div className="space-y-3">
            {[
              { name: "Ananya Rao", subject: "Calculus II", time: "Today · 4:00 PM", status: "Upcoming", color: "from-blue-400 to-indigo-500" },
              { name: "Rahul Verma", subject: "Mechanics", time: "Tomorrow · 6:00 PM", status: "Confirmed", color: "from-emerald-400 to-teal-500" },
              { name: "Sara Iqbal", subject: "Essay Writing", time: "Fri · 11:00 AM", status: "Pending", color: "from-rose-400 to-pink-500" },
              { name: "Daniel Cohen", subject: "Python Basics", time: "Last week", status: "Completed", color: "from-amber-400 to-orange-500" },
            ].map((b,i)=>(
              <div key={i} className="flex items-center gap-4 rounded-xl border border-border p-4 hover:bg-accent/40 transition">
                <div className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${b.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{b.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{b.subject} · {b.time}</div>
                </div>
                <Badge variant={b.status === "Completed" ? "secondary" : "default"} className={
                  b.status === "Upcoming" ? "bg-gradient-primary border-0" :
                  b.status === "Pending" ? "bg-warning/20 text-warning-foreground border-0" : ""
                }>{b.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-border/60">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold">Saved tutors</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/tutors">Browse tutors</Link>
            </Button>
          </div>
          {savedTutors.length > 0 ? (
            <div className="space-y-4">
              {savedTutors.map((tutor) => (
                <div key={tutor.id} className="flex flex-col gap-4 rounded-3xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between bg-white">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-3xl overflow-hidden bg-slate-200">
                      {tutor.profilePhoto ? (
                        <img src={tutor.profilePhoto} alt={tutor.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-semibold">
                          {tutor.name?.split(" ").map((word) => word[0]).join("")}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{tutor.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{tutor.subject}</div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-semibold">{tutor.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">${tutor.price}/hr</span>
                      </div>
                    </div>
                  </div>
                  <Button asChild size="sm" className="w-full sm:w-auto">
                    <Link to={`/tutors/${tutor.id}`}>View profile</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white/80 p-6 text-center text-sm text-gray-600">
              No saved tutors yet. Save a tutor from the Find Tutors page to see them here.
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-6 border-border/60">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notifications</h2>
        </div>
        <div className="space-y-2">
          {[
            { text: "Ananya confirmed your booking for Calculus II", time: "10 min ago", new: true },
            { text: "New message from Rahul Verma", time: "1 hour ago", new: true },
            { text: "Your session with Daniel was rated 5 stars", time: "Yesterday", new: false },
          ].map((n,i)=>(
            <div key={i} className={`flex items-center gap-3 rounded-xl p-3 ${n.new ? "bg-primary/5" : ""}`}>
              <div className={`h-2 w-2 rounded-full ${n.new ? "bg-primary" : "bg-muted"}`} />
              <div className="flex-1 text-sm">{n.text}</div>
              <div className="text-xs text-muted-foreground">{n.time}</div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardShell>
  );
}

export default StudentDashboard;
