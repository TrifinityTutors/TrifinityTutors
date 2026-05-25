import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, Calendar, Users, DollarSign, BarChart3, Settings, MessageCircle, TrendingUp, Eye, Star, Bell } from "lucide-react";
import { DashboardShell, StatCard } from "@/components/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/tutor")({
  component: TutorDashboard,
});

const nav = [
  { to: "/dashboard/tutor", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/tutor", label: "Schedule", icon: Calendar },
  { to: "/dashboard/tutor", label: "Students", icon: Users },
  { to: "/dashboard/tutor", label: "Earnings", icon: DollarSign },
  { to: "/dashboard/tutor", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/tutor", label: "Messages", icon: MessageCircle },
  { to: "/dashboard/tutor", label: "Settings", icon: Settings },
];

function TutorDashboard() {
  return (
    <DashboardShell navItems={nav} title="Tutor Dashboard" role="Tutor">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="This month earnings" value="$2,840" delta="+18% vs last" icon={DollarSign} accent="success" />
        <StatCard label="Active students" value="24" delta="+3 new" icon={Users} />
        <StatCard label="Hours taught" value="96" delta="+12 hrs" icon={Calendar} accent="warning" />
        <StatCard label="Profile views" value="1.2k" delta="+24%" icon={Eye} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 border-border/60">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-semibold">Earnings overview</h2>
              <p className="text-xs text-muted-foreground">Last 7 months</p>
            </div>
            <Badge className="bg-success/15 text-success border-0"><TrendingUp className="h-3 w-3 mr-1" /> +18%</Badge>
          </div>
          <BarChart />
        </Card>

        <Card className="p-6 border-border/60">
          <h2 className="font-display font-semibold">Student requests</h2>
          <p className="text-xs text-muted-foreground mb-4">3 new this week</p>
          <div className="space-y-3">
            {[
              { name: "Rohan M.", subject: "Calculus I", color: "from-blue-400 to-indigo-500" },
              { name: "Sneha K.", subject: "Linear Algebra", color: "from-rose-400 to-pink-500" },
              { name: "Adil F.", subject: "SAT Math", color: "from-emerald-400 to-teal-500" },
            ].map((r,i)=>(
              <div key={i} className="rounded-xl border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${r.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{r.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{r.subject}</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="flex-1 h-8 bg-gradient-primary">Accept</Button>
                  <Button size="sm" variant="outline" className="flex-1 h-8">Decline</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6 border-border/60">
          <h2 className="font-display font-semibold mb-5">Today's schedule</h2>
          <div className="space-y-3">
            {[
              { time: "10:00 AM", student: "Priya S.", subject: "Calculus II", color: "from-blue-400 to-indigo-500" },
              { time: "1:30 PM", student: "Arjun M.", subject: "Linear Algebra", color: "from-emerald-400 to-teal-500" },
              { time: "5:00 PM", student: "Sara K.", subject: "Probability", color: "from-rose-400 to-pink-500" },
            ].map((s,i)=>(
              <div key={i} className="flex items-center gap-4 rounded-xl border border-border p-4 hover:bg-accent/40 transition">
                <div className="text-center w-16">
                  <div className="font-display font-bold">{s.time.split(" ")[0]}</div>
                  <div className="text-xs text-muted-foreground">{s.time.split(" ")[1]}</div>
                </div>
                <div className={`h-1 w-1 self-stretch rounded-full bg-gradient-to-b ${s.color}`} />
                <div className="flex-1">
                  <div className="font-medium">{s.subject}</div>
                  <div className="text-sm text-muted-foreground">with {s.student}</div>
                </div>
                <Button size="sm" variant="outline">Join</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-border/60">
          <h2 className="font-display font-semibold mb-5">Profile analytics</h2>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Profile completeness</span>
                <span className="font-semibold">92%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-primary rounded-full" style={{ width: "92%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Response rate</span>
                <span className="font-semibold">98%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: "98%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Avg. session rating</span>
                <span className="font-semibold flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> 4.93</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-warning rounded-full" style={{ width: "98%" }} />
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-gradient-soft p-4 flex items-center gap-3">
            <Bell className="h-4 w-4 text-primary" />
            <p className="text-xs">Complete your profile to unlock <span className="font-semibold">"Featured Tutor"</span> badge</p>
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
          <div className="w-full bg-gradient-to-t from-primary to-primary-glow rounded-t-xl transition-all hover:opacity-80 relative group" style={{ height: `${(v/max)*100}%` }}>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition">${v*30}</div>
          </div>
          <div className="text-xs text-muted-foreground">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}
