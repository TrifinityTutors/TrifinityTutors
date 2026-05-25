import { LayoutDashboard, Users, GraduationCap, DollarSign, Flag, Settings, FileBarChart, TrendingUp, MoreHorizontal, Search } from "lucide-react";
import { DashboardShell, StatCard } from "@/components/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin", label: "Users", icon: Users },
  { to: "/admin", label: "Tutors", icon: GraduationCap },
  { to: "/admin", label: "Payments", icon: DollarSign },
  { to: "/admin", label: "Reports", icon: FileBarChart },
  { to: "/admin", label: "Flags", icon: Flag },
  { to: "/admin", label: "Settings", icon: Settings },
];

const users = [
  { name: "Ananya Rao", email: "ananya@email.com", role: "Tutor", status: "Active", joined: "Mar 12, 2024", color: "from-blue-400 to-indigo-500" },
  { name: "Rohan Mehta", email: "rohan.m@email.com", role: "Student", status: "Active", joined: "Apr 02, 2024", color: "from-emerald-400 to-teal-500" },
  { name: "Sara Iqbal", email: "sara.iqbal@email.com", role: "Tutor", status: "Pending", joined: "Apr 18, 2024", color: "from-rose-400 to-pink-500" },
  { name: "Daniel Cohen", email: "daniel.c@email.com", role: "Tutor", status: "Active", joined: "May 04, 2024", color: "from-amber-400 to-orange-500" },
  { name: "Priya Sharma", email: "priya.s@email.com", role: "Student", status: "Active", joined: "May 21, 2024", color: "from-violet-400 to-purple-500" },
  { name: "Kabir Singh", email: "kabir@email.com", role: "Tutor", status: "Suspended", joined: "Jun 09, 2024", color: "from-cyan-400 to-blue-500" },
];

function AdminDashboard() {
  return (
    <DashboardShell navItems={nav} title="Admin Overview" role="Admin">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value="48,290" delta="+12.4% MoM" icon={Users} />
        <StatCard label="Active tutors" value="2,841" delta="+186 this month" icon={GraduationCap} accent="success" />
        <StatCard label="Monthly revenue" value="$184k" delta="+22.1%" icon={DollarSign} accent="warning" />
        <StatCard label="Open reports" value="12" icon={Flag} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 border-border/60">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-semibold">Platform growth</h2>
              <p className="text-xs text-muted-foreground">Sessions completed · last 8 weeks</p>
            </div>
            <Badge className="bg-success/15 text-success border-0"><TrendingUp className="h-3 w-3 mr-1" /> +22%</Badge>
          </div>
          <LineChart />
        </Card>

        <Card className="p-6 border-border/60">
          <h2 className="font-display font-semibold mb-1">Top subjects</h2>
          <p className="text-xs text-muted-foreground mb-5">By bookings this month</p>
          <div className="space-y-4">
            {[
              { name: "Mathematics", val: 84 },
              { name: "Programming", val: 72 },
              { name: "Science", val: 68 },
              { name: "Languages", val: 56 },
              { name: "Test Prep", val: 41 },
            ].map((s,i)=>(
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground">{s.val}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${s.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-6 border-border/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div>
            <h2 className="font-display font-semibold">User management</h2>
            <p className="text-xs text-muted-foreground">Manage all platform users</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 rounded-xl bg-muted/60 w-64">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-9" placeholder="Search users..." />
            </div>
            <Button className="bg-gradient-primary shadow-glow">Add User</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 pr-4 font-medium">User</th>
                <th className="py-3 pr-4 font-medium">Role</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Joined</th>
                <th className="py-3 pr-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${u.color}`} />
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <Badge variant="secondary">{u.role}</Badge>
                  </td>
                  <td className="py-4 pr-4">
                    <Badge className={
                      u.status === "Active" ? "bg-success/15 text-success border-0" :
                      u.status === "Pending" ? "bg-warning/15 text-warning-foreground border-0" :
                      "bg-destructive/15 text-destructive border-0"
                    }>{u.status}</Badge>
                  </td>
                  <td className="py-4 pr-4 text-muted-foreground">{u.joined}</td>
                  <td className="py-4 pr-4 text-right">
                    <button className="grid h-8 w-8 place-items-center rounded-lg hover:bg-accent">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardShell>
  );
}

function LineChart() {
  const data = [38, 52, 49, 65, 60, 78, 82, 95];
  const max = 100;
  const w = 600, h = 200, step = w / (data.length - 1);
  const points = data.map((v,i) => `${i*step},${h - (v/max)*h}`).join(" ");
  const area = `${points} ${w},${h} 0,${h}`;
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-56" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.55 0.21 260)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="oklch(0.55 0.21 260)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.55 0.21 260)" />
            <stop offset="100%" stopColor="oklch(0.72 0.18 240)" />
          </linearGradient>
        </defs>
        <polygon fill="url(#ag)" points={area} />
        <polyline fill="none" stroke="url(#lg)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points} />
        {data.map((v,i) => (
          <circle key={i} cx={i*step} cy={h-(v/max)*h} r="4" fill="white" stroke="oklch(0.55 0.21 260)" strokeWidth="2" />
        ))}
      </svg>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        {["W1","W2","W3","W4","W5","W6","W7","W8"].map(l=> <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

export default AdminDashboard;
