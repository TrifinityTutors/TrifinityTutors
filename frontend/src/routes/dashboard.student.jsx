import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, Search, Heart, Calendar, Bell, MessageCircle, Settings, BookOpen, Star, Clock } from "lucide-react";
import { DashboardShell, StatCard } from "@/components/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/student")({
  component: StudentDashboard,
});

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
  return (
    <DashboardShell navItems={nav} title="Welcome back, Ananya 👋" role="Student">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active sessions" value="3" delta="+1 this week" icon={BookOpen} />
        <StatCard label="Saved tutors" value="12" icon={Heart} accent="success" />
        <StatCard label="Hours learned" value="48" delta="+6 this month" icon={Clock} accent="warning" />
        <StatCard label="Average rating" value="4.9" icon={Star} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 border-border/60">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold">Recent bookings</h2>
            <Button variant="ghost" size="sm">View all</Button>
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
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <div className="space-y-4">
            {[
              { name: "Mei Lin", subject: "Chemistry", rating: 4.92, color: "from-violet-400 to-purple-500" },
              { name: "Kabir Singh", subject: "SAT Prep", rating: 4.88, color: "from-cyan-400 to-blue-500" },
              { name: "Amelia Brown", subject: "Biology", rating: 4.85, color: "from-rose-400 to-pink-500" },
            ].map((t,i)=>(
              <div key={i} className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.subject}</div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  <span className="font-semibold">{t.rating}</span>
                </div>
              </div>
            ))}
          </div>
          <Button asChild className="mt-5 w-full bg-gradient-primary shadow-glow">
            <Link to="/tutors">Discover more</Link>
          </Button>
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
