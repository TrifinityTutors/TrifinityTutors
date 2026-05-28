import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, Search, Heart, Calendar, Bell, MessageCircle, Settings, MapPin, ExternalLink } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
  { to: "/tutors", label: "Find Tutors", icon: Search },
  { to: "/dashboard/student", label: "Saved Tutors", icon: Heart },
  { to: "/dashboard/student/bookings", label: "Bookings", icon: Calendar },
  { to: "/dashboard/student", label: "Messages", icon: MessageCircle },
  { to: "/dashboard/student", label: "Notifications", icon: Bell },
  { to: "/dashboard/student", label: "Settings", icon: Settings },
];

const tabOptions = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const statusStyles = {
  upcoming:   "bg-blue-100 text-blue-800 border-0",
  completed:  "bg-emerald-100 text-emerald-800 border-0",
  cancelled:  "bg-red-100 text-red-800 border-0",
};

const avatarColors = [
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-blue-500",
];

function formatBookingDate(date, time) {
  if (!date) return "";
  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return `${formattedDate}${time ? ` · ${time}` : ""}`;
}


function StudentBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem("token");
      if (!token) navigate("/auth/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/bookings/student", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentBookings = useMemo(
    () => bookings.filter((booking) => booking.bookingStatus === activeTab),
    [bookings, activeTab]
  );

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to cancel booking");
      setBookings((prev) => prev.map((booking) => booking._id === bookingId ? data.booking : booking));
    } catch (err) {
      alert(err.message || "Could not cancel booking.");
    }
  };

  const userName = user?.name || "Student";

  return (
    <DashboardShell navItems={nav} title="My Bookings" role="Student">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Bookings</h2>
            <p className="text-sm text-slate-500">Manage your upcoming, completed, and cancelled sessions.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabOptions.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Card className="p-10 text-center border-border/60">
            <p className="text-slate-500">Loading your bookings...</p>
          </Card>
        ) : error ? (
          <Card className="p-10 text-center border-border/60">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchBookings} className="mt-4" variant="outline">Retry</Button>
          </Card>
        ) : currentBookings.length === 0 ? (
          <Card className="p-10 text-center border-border/60">
            <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900">No {activeTab} bookings yet</h3>
            <p className="mt-2 text-sm text-slate-500">Book a session and it will appear here once confirmed.</p>
            <Button onClick={() => navigate('/tutors')} className="mt-6">
              Find a tutor
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {currentBookings.map((booking, index) => (
              <Card key={booking._id} className="grid gap-4 rounded-3xl border border-slate-200 p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div className="flex items-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${avatarColors[index % avatarColors.length]} text-white text-lg font-semibold`}> 
                    {booking.tutorName?.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900 truncate">{booking.tutorName}</p>
                    <p className="text-sm text-slate-500 truncate">{booking.subject}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Session</p>
                    <p className="mt-1 text-sm text-slate-900">{formatBookingDate(booking.date, booking.time)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Mode</p>
                    <p className="mt-1 text-sm text-slate-900">{booking.mode === 'home' ? 'Home visit' : 'Online session'}</p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <Badge className={statusStyles[booking.bookingStatus] || 'bg-slate-100 text-slate-700'}>
                    {booking.bookingStatus?.charAt(0).toUpperCase() + booking.bookingStatus?.slice(1)}
                  </Badge>
                  <div className="flex flex-wrap gap-2">
                    {booking.mode === 'online' && booking.bookingStatus === 'upcoming' && (
                      <Button size="sm" variant="outline" onClick={() => window.open(booking.meetingLink || '#', '_blank')}>
                        <ExternalLink className="mr-2 h-4 w-4" /> Join
                      </Button>
                    )}
                    {booking.mode === 'home' && booking.bookingStatus === 'upcoming' && (
                      <Button size="sm" variant="outline" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.location || '')}`, '_blank')}>
                        <MapPin className="mr-2 h-4 w-4" /> Directions
                      </Button>
                    )}
                    {booking.bookingStatus === 'upcoming' && (
                      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleCancel(booking._id)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export default StudentBookings;