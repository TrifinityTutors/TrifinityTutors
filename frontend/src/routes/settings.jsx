import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "react-router-dom";
import { DashLayout } from "@/components/dash/DashLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch ";
import { Label } from "@/components/ui/Label";
import { Home, User as UserIcon, Settings as SettingsIcon, Bell, Shield, Trash2 } from "lucide-react";
import { useAuth, dashboardPathFor } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Trifinity" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({ emailNotif: true, smsNotif: false, marketing: false, twoFA: false });

  const items = [
    { to: dashboardPathFor(user?.role ?? "student"), label: "Overview", icon: Home },
    { to: "/profile", label: "Profile", icon: UserIcon },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  function toggle(k) {
    setPrefs(p => ({ ...p, [k]: !p[k] }));
    toast.success("Preference updated");
  }

  function del() {
    logout();
    toast.success("Account deleted");
    navigate({ to: "/" });
  }

  return (
    <DashLayout items={items} title="Settings">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        <Card className="rounded-3xl p-6 border-border/60 shadow-card">
          <h2 className="font-bold flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</h2>
          <div className="mt-4 space-y-4">
            {[
              ["emailNotif", "Email notifications", "Booking confirmations, reminders, receipts."],
              ["smsNotif", "SMS reminders", "Session reminders 1 hour before."],
              ["marketing", "Marketing emails", "Tips, new tutors, occasional offers."],
            ].map(([k, l, d]) => (
              <div key={k} className="flex items-center justify-between gap-4">
                <div><Label className="text-sm font-medium">{l}</Label><p className="text-xs text-muted-foreground">{d}</p></div>
                <Switch checked={prefs[k]} onCheckedChange={() => toggle(k)} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-3xl p-6 border-border/60 shadow-card">
          <h2 className="font-bold flex items-center gap-2"><Shield className="h-4 w-4" /> Security</h2>
          <div className="mt-4 flex items-center justify-between">
            <div><Label>Two-factor authentication</Label><p className="text-xs text-muted-foreground">Add an extra layer of security.</p></div>
            <Switch checked={prefs.twoFA} onCheckedChange={() => toggle("twoFA")} />
          </div>
          <Button variant="outline" className="mt-4 rounded-xl" onClick={() => toast.success("Password reset email sent")}>Change password</Button>
        </Card>

        <Card className="rounded-3xl p-6 border-destructive/30 bg-destructive/5">
          <h2 className="font-bold text-destructive flex items-center gap-2"><Trash2 className="h-4 w-4" /> Danger zone</h2>
          <p className="text-sm text-muted-foreground mt-2">Permanently delete your account and all associated data.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive" className="mt-4 rounded-xl">Delete account</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete your account, sessions, and reviews. This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={del} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Yes, delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>
    </DashLayout>
  );
}
