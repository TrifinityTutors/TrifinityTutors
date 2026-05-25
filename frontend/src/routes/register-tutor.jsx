import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Upload, ArrowRight, ArrowLeft, User, GraduationCap, BookOpen, DollarSign } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/register-tutor")({
  component: RegisterTutorPage,
});

const steps = [
  { icon: User, title: "Profile", desc: "Tell us about you" },
  { icon: GraduationCap, title: "Education", desc: "Your qualifications" },
  { icon: BookOpen, title: "Subjects", desc: "What you teach" },
  { icon: DollarSign, title: "Pricing", desc: "Set your rate" },
];

const allSubjects = ["Mathematics","Physics","Chemistry","Biology","English","Computer Science","Economics","History","French","Spanish","Music","Art","Calculus","Algebra","Python","JavaScript","SAT Prep","IELTS"];

function RegisterTutorPage() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(["Mathematics","Calculus"]);

  const toggle = (s) =>
    setSelected(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Become a Trifinity Tutor</h1>
          <p className="mt-2 text-muted-foreground">Share your knowledge, set your hours, earn on your terms.</p>
        </div>

        <div className="mt-10 flex items-center justify-between gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 flex items-center">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className={`relative grid h-12 w-12 place-items-center rounded-2xl transition-all ${
                  i <= step ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <div className="text-center hidden sm:block">
                  <div className={`text-xs font-semibold ${i<=step ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
              </div>
              {i < steps.length-1 && (
                <div className={`h-0.5 flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="mt-8 border-border/60 p-6 sm:p-10">
          {step === 0 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-display text-xl font-semibold">Tell us about yourself</h2>
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-300 to-indigo-400 grid place-items-center text-white font-display text-2xl font-bold">A</div>
                  <button className="absolute -bottom-1.5 -right-1.5 grid h-9 w-9 place-items-center rounded-xl bg-card border border-border shadow-soft hover:bg-accent">
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold">Upload profile photo</p>
                  <p className="text-sm text-muted-foreground">PNG or JPG, max 5MB</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" placeholder="Ananya" />
                <Field label="Last name" placeholder="Rao" />
                <Field label="Email" placeholder="you@email.com" />
                <Field label="Phone" placeholder="+91 98xxxxxxxx" />
                <Field label="City" placeholder="Bangalore" className="sm:col-span-2" />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea className="mt-2" rows={4} placeholder="Introduce yourself — your passion, teaching style, and what makes you unique." />
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-display text-xl font-semibold">Your education</h2>
              <Field label="University" placeholder="IISc Bangalore" />
              <Field label="Degree" placeholder="B.Sc Mathematics" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Start year" placeholder="2022" />
                <Field label="End year (or expected)" placeholder="2026" />
              </div>
              <div>
                <Label>Upload transcript / certificate</Label>
                <div className="mt-2 rounded-xl border-2 border-dashed border-border p-8 text-center hover:border-primary hover:bg-primary/5 cursor-pointer transition">
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-sm">Drag & drop or <span className="text-primary font-semibold">browse</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">PDF, PNG, JPG up to 10MB</p>
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-display text-xl font-semibold">Subjects you teach</h2>
              <p className="text-sm text-muted-foreground">Select all that apply. You can change these later.</p>
              <div className="flex flex-wrap gap-2">
                {allSubjects.map(s => {
                  const on = selected.includes(s);
                  return (
                    <button key={s} onClick={() => toggle(s)} className={`rounded-full px-4 py-2 text-sm font-medium transition-all border ${
                      on ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow" : "bg-card border-border hover:border-primary hover:text-primary"
                    }`}>
                      {on && <Check className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}{s}
                    </button>
                  );
                })}
              </div>
              <div className="rounded-xl bg-muted/60 p-4 text-sm">
                <span className="font-semibold">{selected.length}</span> subjects selected
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-display text-xl font-semibold">Set your rate</h2>
              <div className="rounded-2xl bg-gradient-primary p-8 text-primary-foreground text-center shadow-glow">
                <div className="text-sm opacity-80">Your hourly rate</div>
                <div className="mt-2 font-display text-5xl font-bold">$28<span className="text-xl font-normal opacity-80">/hr</span></div>
                <p className="mt-3 text-sm opacity-90">Suggested based on your subjects & experience</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your rate ($/hr)" placeholder="28" />
                <Field label="Trial session rate ($/hr)" placeholder="15" />
              </div>
              <div className="rounded-xl border border-border p-4 flex gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  You can adjust your rate anytime. Trifinity takes a small commission only when you complete paid sessions.
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <Button variant="ghost" disabled={step===0} onClick={() => setStep(s => Math.max(0, s-1))}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step < steps.length-1 ? (
              <Button onClick={() => setStep(s => Math.min(steps.length-1, s+1))} className="bg-gradient-primary shadow-glow">
                Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button asChild className="bg-gradient-primary shadow-glow">
                <Link to="/dashboard/tutor">Submit Application <Check className="ml-1 h-4 w-4" /></Link>
              </Button>
            )}
          </div>
        </Card>
      </div>
    </SiteLayout>
  );
}

function Field({ label, placeholder, className }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <Input className="mt-2" placeholder={placeholder} />
    </div>
  );
}

export default RegisterTutorPage;
