import { useEffect, useMemo, useRef, useState } from "react";
import { io as ioClient } from "socket.io-client";
import { LayoutDashboard, Calendar, Users, DollarSign, BarChart3, Settings, MessageCircle, TrendingUp, Eye, Star, Bell } from "lucide-react";
import { DashboardShell, StatCard } from "@/components/DashboardShell";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import SessionCalendar from "@/components/SessionCalendar";

const nav = [
  { to: "/tutor-dashboard", label: "Overview", icon: LayoutDashboard, activeWhen: "/tutor-dashboard" },
  { to: "/tutor/schedule", label: "Schedule", icon: Calendar },
  { to: "/tutor/students", label: "Students", icon: Users },
  { to: "/tutor-dashboard", label: "Analytics", icon: BarChart3, stayOnDashboard: true },
  { to: "/tutor/messages", label: "Messages", icon: MessageCircle },
  { to: "/tutor/settings", label: "Settings", icon: Settings },
];

function TutorDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/bookings/tutor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Unable to load bookings");
      }
      const data = await res.json();
      setBookings(data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const endpoint = import.meta.env.DEV ? "http://localhost:5000" : window.location.origin;
    const socket = ioClient(endpoint, { transports: ["websocket"] });
    socketRef.current = socket;

    const user = JSON.parse(localStorage.getItem("user") || "{}") || {};
    const userId = user._id || user.id || user.userId;
    if (userId) {
      socket.on("connect", () => {
        socket.emit("join", userId.toString());
      });
    }

    const refreshData = () => loadData();
    socket.on("new_booking", refreshData);
    socket.on("booking_updated", refreshData);
    socket.on("booking_confirmed", refreshData);
    socket.on("notification", refreshData);

    return () => {
      socket.off("new_booking", refreshData);
      socket.off("booking_updated", refreshData);
      socket.off("booking_confirmed", refreshData);
      socket.off("notification", refreshData);
      socket.disconnect();
    };
  }, []);

  const easyBookingStatus = (booking) => {
    const status = booking.bookingStatus || booking.status || "upcoming";
    return status === "confirmed" ? "upcoming" : status;
  };

  const upcoming = useMemo(
    () => bookings.filter((booking) => easyBookingStatus(booking) === "upcoming"),
    [bookings]
  );
  const monthEarnings = useMemo(
    () => bookings.reduce((sum, booking) => easyBookingStatus(booking) === "completed" ? sum + Number(booking.totalAmount || 0) : sum, 0),
    [bookings]
  );
  const activeStudentsCount = useMemo(() => {
    const ids = new Set(
      bookings
        .filter((booking) => booking.bookingStatus === "upcoming")
        .map((booking) => booking.studentId?._id || booking.studentId || booking.studentName)
    );
    return ids.size;
  }, [bookings]);
  const upcomingSessions = upcoming.slice(0, 3);
  const recentBookings = bookings.slice(0, 3);

  return (
    <DashboardShell navItems={nav} title="Tutor Dashboard" role="Tutor">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="This month earnings" value={`₹${monthEarnings.toFixed(0)}`} delta="Updated" icon={DollarSign} accent="success" />
        <StatCard label="Active students" value={`${activeStudentsCount}`} delta="Active now" icon={Users} />
        <StatCard label="Upcoming sessions" value={`${upcoming.length}`} delta="Booked" icon={Calendar} accent="warning" />
        <StatCard label="Profile views" value="1.2k" delta="+24%" icon={Eye} />
      </div>

      <div className="mt-8">
        <Card className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-[0.18em]">Session Calendar</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">All your bookings, updated live.</h2>
            </div>
            <Button variant="outline" size="sm" onClick={loadData}>Refresh</Button>
          </div>
          <SessionCalendar bookings={bookings} role="Tutor" />
          {error && (
            <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 m-0">Earnings overview</h2>
              <p className="text-xs text-gray-500 m-0 mt-1">Last 7 months</p>
            </div>
            <Badge className="bg-green-100 text-green-700 border-0 flex items-center gap-1 px-3 py-1">
              <TrendingUp size={14} /> +18%
            </Badge>
          </div>
          <BarChart />
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Recent bookings</h2>
          <p className="text-xs text-gray-500 mb-4">Latest activity from students</p>
          <div className="space-y-4">
            {recentBookings.length === 0 ? (
              <div className="rounded-lg border border-gray-100 p-4 text-sm text-slate-500">No recent bookings yet</div>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking._id} className="rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{booking.studentId?.name || booking.studentName || 'Student'}</div>
                      <div className="text-xs text-gray-500">{booking.subject} · {booking.date} · {booking.time}</div>
                    </div>
                    <Badge
                      className={`rounded-full px-3 py-1 text-xs ${
                        booking.bookingStatus === 'upcoming'
                          ? 'bg-blue-100 text-blue-700'
                          : booking.bookingStatus === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {booking.bookingStatus}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Today's schedule</h2>
              <p className="text-xs text-gray-500">Upcoming sessions and time slots</p>
            </div>
          </div>
          {loading ? (
            <div className="text-sm text-slate-500">Loading schedule…</div>
          ) : upcomingSessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-slate-500">No upcoming sessions yet</div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((booking) => (
                <div key={booking._id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition">
                  <div className="text-center w-16">
                    <div className="text-sm font-semibold text-gray-900">{booking.time.split(" ")[0]}</div>
                    <div className="text-xs text-gray-500">{booking.time.split(" ")[1]}</div>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-blue-500 self-stretch" />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{booking.subject}</div>
                    <div className="text-xs text-gray-500">with {booking.studentId?.name || booking.studentName || 'Student'}</div>
                  </div>
                  <Button size="sm" variant="outline">Join</Button>
                </div>
              ))}
            </div>
          )}
          {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Profile analytics</h2>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Profile completeness</span>
                <span className="font-semibold text-gray-900">92%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "92%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Response rate</span>
                <span className="font-semibold text-gray-900">98%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "98%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Avg. session rating</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" /> 4.93
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: "98%" }} />
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 p-4 flex items-center gap-3">
            <Bell className="h-4 w-4 text-blue-600" />
            <p className="text-xs text-slate-600">Respond quickly to new booking requests to keep your schedule full.</p>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

function BarChart() {
  const data = [42, 58, 49, 71, 65, 84, 92];
  const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul"];
  const max = 100;
  return (
    <div className="h-56 flex items-end gap-3">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div 
            className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl transition-all hover:opacity-80 relative group" 
            style={{ height: `${(v/max)*100}%` }}
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition">${v*30}</div>
          </div>
          <div className="text-xs text-gray-500">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

export default TutorDashboard;