import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, MapPin, Calendar, MessageCircle, Award, Clock, GraduationCap, Languages, CheckCircle2, ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/tutors/$id")({
  component: TutorProfilePage,
});

function TutorProfilePage() {
  const { id } = Route.useParams();
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/tutors" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to tutors
        </Link>

        <Card className="mt-5 overflow-hidden border-border/60">
          <div className="h-32 bg-gradient-primary" />
          <div className="px-6 pb-6 sm:px-10">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="relative h-28 w-28 rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-500 grid place-items-center text-white font-display text-3xl font-bold shadow-glow ring-4 ring-card">
                  AR
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success ring-2 ring-card" />
                </div>
                <div className="sm:pb-2">
                  <h1 className="font-display text-2xl font-bold sm:text-3xl">Ananya Rao</h1>
                  <p className="text-muted-foreground">Senior Mathematics & Calculus Tutor · ID #{id}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" /><span className="font-semibold text-foreground">4.93</span> (218)</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> Bangalore</span>
                    <span className="inline-flex items-center gap-1"><Award className="h-4 w-4" /> Verified</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="text-right">
                  <div className="font-display text-3xl font-bold">$28<span className="text-base font-normal text-muted-foreground">/hr</span></div>
                </div>
                <Button size="lg" className="bg-gradient-primary shadow-glow">Book Session</Button>
                <Button size="lg" variant="outline"><MessageCircle className="mr-1.5 h-4 w-4" /> Message</Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="p-6 border-border/60">
              <h2 className="font-display text-lg font-semibold">About Ananya</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                I'm a final-year Mathematics undergraduate at IISc Bangalore with 4 years of tutoring experience.
                I love breaking down complex calculus and algebra concepts into intuitive, memorable steps. My
                students consistently improve their grades and grow to actually enjoy math.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: GraduationCap, label: "Education", val: "IISc Bangalore" },
                  { icon: Clock, label: "Experience", val: "4+ years" },
                  { icon: Languages, label: "Languages", val: "English, Hindi" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-muted/60 p-4">
                    <s.icon className="h-4 w-4 text-primary" />
                    <div className="mt-2 text-xs text-muted-foreground">{s.label}</div>
                    <div className="font-semibold">{s.val}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-border/60">
              <h2 className="font-display text-lg font-semibold">Skills & Subjects</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Calculus","Linear Algebra","Differential Equations","Probability","SAT Math","AP Calc BC","Olympiad","Trigonometry"].map(s => (
                  <Badge key={s} className="bg-primary/10 text-primary border-0 hover:bg-primary/15 px-3 py-1.5">{s}</Badge>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-border/60">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Reviews</h2>
                <span className="text-sm text-muted-foreground">218 reviews</span>
              </div>
              <div className="mt-5 space-y-5">
                {[
                  { name: "Rohan M.", text: "Made calculus actually click. My grade jumped from C+ to A in one semester.", rating: 5 },
                  { name: "Sneha K.", text: "Patient, kind, and incredibly clear explanations. Worth every penny.", rating: 5 },
                  { name: "Adil F.", text: "Helped me prep for SAT Math — scored 780. Highly recommend!", rating: 5 },
                ].map((r,i)=>(
                  <div key={i} className="flex gap-4 border-b border-border last:border-0 pb-5 last:pb-0">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{r.name}</div>
                        <div className="flex">{[...Array(r.rating)].map((_,i)=><Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />)}</div>
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-border/60">
              <h3 className="font-display font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Availability this week</h3>
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {["M","T","W","T","F","S","S"].map((d,i)=>(
                  <div key={i} className="text-center">
                    <div className="text-xs text-muted-foreground">{d}</div>
                    <div className={`mt-1.5 h-9 rounded-lg grid place-items-center text-xs font-medium ${[true,true,false,true,true,false,true][i] ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/50"}`}>
                      {[true,true,false,true,true,false,true][i] ? "Free" : "—"}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2">
                {["10:00 AM - 11:00 AM","2:00 PM - 3:00 PM","6:30 PM - 7:30 PM"].map(t => (
                  <button key={t} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium hover:border-primary hover:bg-primary/5 transition">
                    {t}
                  </button>
                ))}
              </div>
              <Button className="mt-5 w-full bg-gradient-primary shadow-glow">Book a Session</Button>
            </Card>

            <Card className="p-6 border-border/60 bg-gradient-soft">
              <h3 className="font-display font-semibold">Why book with Ananya</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {["Identity & background verified","Money-back guarantee","Free 15-min intro call","Flexible cancellations"].map(b => (
                  <li key={b} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" />{b}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
