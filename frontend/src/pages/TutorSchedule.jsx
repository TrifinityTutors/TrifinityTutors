import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DashLayout } from "@/components/dash/DashLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Calendar, MessageSquare, Bell, Video, MapPin, ArrowRight, XCircle, CheckCircle, RefreshCw } from "lucide-react";
import { useAuth, dashboardPathFor } from "@/lib/auth";
import { toast } from "sonner";
import { io as ioClient } from "socket.io-client";

const tabLabels = ["Upcoming", "Completed", "Cancelled"];

function normalizeBookingStatus(booking) {
  const status = booking.bookingStatus || booking.status || "upcoming";
  if (status === "confirmed") return "upcoming";
  return status;
}

export default function TutorSchedule() {
  const { user } = useAuth();
  const [tab, setTab] = useState("Upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  const items = [
    { to: dashboardPathFor(user?.role ?? "tutor"), label: "Overview", icon: Home },
    { to: "/tutor/schedule", label: "My Sessions", icon: Calendar },
    { to: "/tutor/messages", label: "Messages", icon: MessageSquare },
    { to: "/tutor/notifications", label: "Notifications", icon: Bell },
  ];

  const loadBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/bookings/tutor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Unable to load bookings");
      }
      const data = await res.json();
      setBookings(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load schedule");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    const endpoint = import.meta.env.DEV ? "http://localhost:5000" : window.location.origin;
    const socket = ioClient(endpoint, { transports: ["websocket"] });
    socketRef.current = socket;
    const userId = user?._id || user?.id || user?.userId;
    if (userId) {
      socket.on("connect", () => socket.emit("join", userId));
    }

    const refreshSchedule = () => loadBookings();
    socket.on("new_booking", refreshSchedule);
    socket.on("booking_updated", refreshSchedule);
    socket.on("booking_confirmed", refreshSchedule);

    return () => {
      socket.off("new_booking", refreshSchedule);
      socket.off("booking_updated", refreshSchedule);
      socket.off("booking_confirmed", refreshSchedule);
      socket.disconnect();
    };
  }, [user]);

  const filtered = useMemo(
    () => bookings.filter((booking) => {
      const status = normalizeBookingStatus(booking);
      if (tab === "Upcoming") return status === "upcoming";
      if (tab === "Completed") return status === "completed";
      return status === "cancelled";
    }),
    [bookings, tab]
  );

  const performAction = async (bookingId, action, payload = {}) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/${bookingId}/${action}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: Object.keys(payload).length ? JSON.stringify(payload) : undefined,
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(errBody || "Action failed");
      }
      await loadBookings();
      toast.success(`Session ${action} successful`);
    } catch (err) {
      toast.error(err.message || "Unable to complete action");
      console.error(err);
    }
  };

  const handleReschedule = async (booking) => {
    const newDate = window.prompt("New date (YYYY-MM-DD)", booking.date);
    if (!newDate) return;
    const newTime = window.prompt("New time (HH:MM)", booking.time);
    if (!newTime) return;
    await performAction(booking._id, "reschedule", { date: newDate, time: newTime });
  };

  const handleJoin = (booking) => {
    if (booking.mode === "online") {
      const url = booking.meetingLink || `https://meet.trifinity.io/${booking._id}`;
      window.open(url, "_blank");
      return;
    }
    if (booking.location) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(booking.location)}`, "_blank");
      return;
    }
    toast("Location not available yet");
  };

  return (
    <DashLayout items={items} title="Schedule">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">My sessions</h1>
            <p className="text-sm text-slate-500">Track every booking, respond instantly, and keep your schedule updated.</p>
          </div>
          <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm shadow-sm">
            {tabLabels.map((label) => (
              <button
                key={label}
                onClick={() => setTab(label)}
                className={`rounded-xl px-4 py-2 transition ${tab === label ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-900"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Card className="p-8 text-center">Loading sessions…</Card>
        ) : error ? (
          <Card className="p-8 text-center text-rose-700">{error}</Card>
        ) : filtered.length === 0 ? (
          <Card className="rounded-3xl p-12 text-center border-dashed">
            <div className="font-semibold">No {tab.toLowerCase()} sessions</div>
            <p className="text-sm text-slate-500 mt-1">Sessions will appear here when students book with you.</p>
            <Button asChild className="mt-4 rounded-full bg-slate-900 text-white border-0">
              <Link to="/tutor-dashboard">View dashboard</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const student = booking.studentId || {};
              const initials = (student.name || booking.studentName || "Student")
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const status = normalizeBookingStatus(booking);
              const badgeClass = status === "upcoming"
                ? "bg-blue-100 text-blue-700"
                : status === "completed"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700";

              return (
                <Card key={booking._id} className="rounded-3xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="grid h-14 w-14 place-items-center rounded-3xl bg-slate-900 text-white text-lg font-semibold overflow-hidden">
                        {student.photo || booking.studentImage ? (
                          <img src={student.photo || booking.studentImage} alt={student.name || 'Student'} className="h-full w-full object-cover" />
                        ) : initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-lg font-semibold text-slate-900">{student.name || booking.studentName || 'Student'}</div>
                        <div className="text-sm text-slate-500">{booking.subject}</div>
                      </div>
                    </div>
                    <Badge className={`rounded-full px-3 py-1 text-sm ${badgeClass}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3 mt-5">
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Date & time</div>
                      <div className="mt-2 font-medium text-slate-900">{booking.date} · {booking.time}</div>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Mode</div>
                      <div className="mt-2 font-medium text-slate-900 capitalize">{booking.mode}</div>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Booking status</div>
                      <div className="mt-2 font-medium text-slate-900">{booking.status || 'confirmed'}</div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {status === "upcoming" && (
                      <>
                        <Button size="sm" className="rounded-full bg-slate-900 text-white" onClick={() => performAction(booking._id, "accept")}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => performAction(booking._id, "reject")}>
                          <XCircle className="mr-2 h-4 w-4" /> Reject
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleReschedule(booking)}>
                          <RefreshCw className="mr-2 h-4 w-4" /> Reschedule
                        </Button>
                        <Button size="sm" className="rounded-full bg-slate-900 text-white" onClick={() => handleJoin(booking)}>
                          <ArrowRight className="mr-2 h-4 w-4" /> {booking.mode === "online" ? "Join" : "Directions"}
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => performAction(booking._id, "cancel")}>
                          Cancel
                        </Button>
                      </>
                    )}
                    {status === "completed" && (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => toast.success("Session completed")}>View details</Button>
                    )}
                    {status === "cancelled" && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm text-rose-700">Cancelled</span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashLayout>
  );
}
