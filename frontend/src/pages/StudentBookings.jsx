import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, Search, Heart, Calendar, Bell, MessageCircle, Settings } from "lucide-react";
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

const statusStyles = {
  confirmed:        "bg-emerald-100 text-emerald-800 border-0",
  pending:          "bg-yellow-100 text-yellow-800 border-0",
  refund_requested: "bg-orange-100 text-orange-800 border-0",
  refunded:         "bg-gray-100 text-gray-600 border-0",
  cancelled:        "bg-red-100 text-red-800 border-0",
};

const avatarColors = [
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-blue-500",
];

function StudentBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const res = await fetch("/api/bookings/my", {
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

  const handleRefund = async (bookingId) => {
    if (!window.confirm("Request a refund for this session?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/${bookingId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: "Student cancellation" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Refund of ₹${data.refundAmount} initiated. Takes 5–7 business days.`);
      fetchBookings(); // refresh list
    } catch (err) {
      alert(err.message);
    }
  };

  const userName = user?.name || "Student";

  return (
    <DashboardShell navItems={nav} title="My Bookings" role="Student">
      {loading ? (
        <Card className="p-10 text-center border-border/60">
          <p className="text-muted-foreground">Loading your bookings...</p>
        </Card>
      ) : error ? (
        <Card className="p-10 text-center border-border/60">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchBookings} className="mt-4" variant="outline">Retry</Button>
        </Card>
      ) : bookings.length === 0 ? (
        <Card className="p-10 text-center border-border/60">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-semibold text-lg mb-1">No bookings yet</p>
          <p className="text-muted-foreground text-sm mb-6">
            Book a session with a tutor to get started.
          </p>
          <Button onClick={() => navigate("/tutors")} className="bg-gradient-primary">
            Find a tutor
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, i) => {
            const tutor = booking.tutorId;
            const color = avatarColors[i % avatarColors.length];
            const formattedDate = new Date(booking.date).toLocaleDateString("en-IN", {
              year: "numeric", month: "long", day: "numeric",
            });

            return (
              <Card
                key={booking._id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 border-border/60 hover:bg-accent/30 transition"
              >
                {/* Avatar */}
                <div className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${color}`} />

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold truncate">
                    {tutor?.name || "Tutor"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {tutor?.subject || "Session"} · {formattedDate} · {booking.timeSlot}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.mode} · {booking.durationMins} mins · ₹{booking.totalAmount}
                  </p>
                </div>

                {/* Status + action */}
                <div className="flex items-center gap-3 shrink-0">
                  <Badge className={statusStyles[booking.status] || "border-0"}>
                    {booking.status.replace("_", " ")}
                  </Badge>

                  {booking.status === "confirmed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleRefund(booking._id)}
                    >
                      Cancel & refund
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}

export default StudentBookings;