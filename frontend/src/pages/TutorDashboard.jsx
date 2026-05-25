import { LayoutDashboard, Calendar, Users, DollarSign, BarChart3, Settings, MessageCircle, TrendingUp, Eye, Star, Bell } from "lucide-react";
import { DashboardShell, StatCard } from "@/components/DashboardShell";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";

const nav = [
  { to: "/tutor/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/tutor/schedule", label: "Schedule", icon: Calendar },
  { to: "/tutor/students", label: "Students", icon: Users },
  { to: "/tutor/earnings", label: "Earnings", icon: DollarSign },
  { to: "/tutor/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/tutor/messages", label: "Messages", icon: MessageCircle },
  { to: "/tutor/settings", label: "Settings", icon: Settings },
];

function TutorDashboard() {
  return (
    <DashboardShell navItems={nav} title="Tutor Dashboard" role="Tutor">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="This month earnings" value="$2,840" delta="+18% vs last" icon={DollarSign} accent="success" />
        <StatCard label="Active students" value="24" delta="+3 new" icon={Users} />
        <StatCard label="Hours taught" value="96" delta="+12 hrs" icon={Calendar} accent="warning" />
        <StatCard label="Profile views" value="1.2k" delta="+24%" icon={Eye} />
      </div>

      {/* Earnings & Student Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Student requests</h2>
          <p className="text-xs text-gray-500 mb-4">3 new this week</p>
          <div className="space-y-4">
            {[
              { name: "Rohan M.", subject: "Calculus I", color: "bg-blue-400" },
              { name: "Sneha K.", subject: "Linear Algebra", color: "bg-rose-400" },
              { name: "Adil F.", subject: "SAT Math", color: "bg-emerald-400" },
            ].map((r,i)=>(
              <div key={i} className="rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-full ${r.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.subject}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">Accept</Button>
                  <Button size="sm" variant="outline" className="flex-1">Decline</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Schedule & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 m-0">Today's schedule</h2>
          <div className="space-y-3">
            {[
              { time: "10:00 AM", student: "Priya S.", subject: "Calculus II", color: "bg-gradient-to-b from-blue-400 to-indigo-500" },
              { time: "1:30 PM", student: "Arjun M.", subject: "Linear Algebra", color: "bg-gradient-to-b from-emerald-400 to-teal-500" },
              { time: "5:00 PM", student: "Sara K.", subject: "Probability", color: "bg-gradient-to-b from-rose-400 to-pink-500" },
            ].map((s,i)=>(
              <div key={i} className="flex items-center gap-4 rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition">
                <div className="text-center w-16 flex-shrink-0">
                  <div className="text-sm font-semibold text-gray-900">{s.time.split(" ")[0]}</div>
                  <div className="text-xs text-gray-500">{s.time.split(" ")[1]}</div>
                </div>
                <div className={`h-12 w-1 rounded-full ${s.color} flex-shrink-0`} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{s.subject}</div>
                  <div className="text-xs text-gray-500">with {s.student}</div>
                </div>
                <Button size="sm" variant="outline" className="flex-shrink-0">Join</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 m-0">Profile analytics</h2>
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
          <div className="mt-6 rounded-lg bg-blue-50 p-4 flex items-center gap-3">
            <Bell size={16} className="text-blue-600 flex-shrink-0" />
            <p className="text-xs text-gray-700">Complete your profile to unlock <span className="font-semibold">"Featured Tutor"</span> badge</p>
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