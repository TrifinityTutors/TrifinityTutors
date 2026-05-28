import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { Star, MapPin, Calendar, MessageCircle, Award, Clock, GraduationCap, Languages, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/tutors/$id")({
  component: TutorProfilePage,
});

function TutorProfilePage() {
  const { id } = Route.useParams();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`/api/tutors/profile/${id}`);
        if (!mounted) return;
        setTutor(res.data);
      } catch (err) {
        console.error("Failed to fetch tutor profile", err);
        if (!mounted) return;
        setTutor(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">Loading tutor…</div>
    );
  }

  if (!tutor) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <p className="text-xl font-semibold text-foreground">Tutor not found</p>
        <p className="mt-3 text-muted-foreground">The requested tutor profile does not exist.</p>
        <Link
          to="/tutors"
          className="mt-6 inline-flex rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-primary/5"
        >
          Back to tutors
        </Link>
      </div>
    );
  }

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
                <div className={`relative h-28 w-28 rounded-3xl bg-gradient-to-br ${tutor.grad} grid place-items-center text-white font-display text-3xl font-bold shadow-glow ring-4 ring-card`}>
                  {tutor.name.split(" ").map((part) => part[0]).join("")}
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success ring-2 ring-card" />
                </div>
                <div className="sm:pb-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-2xl font-bold sm:text-3xl">{tutor.name}</h1>
                    {tutor.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-muted-foreground">{tutor.subject} · {tutor.college} · Tutor #{tutor.id}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" /><span className="font-semibold text-foreground">{tutor.rating.toFixed(2)}</span> ({tutor.reviews})</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{tutor.location}</span>
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
              <h2 className="font-display text-lg font-semibold">About {tutor.name.split(" ")[0]}</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">{tutor.bio}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: GraduationCap, label: "Education", val: tutor.education },
                  { icon: Clock, label: "Experience", val: `${tutor.exp}+ years` },
                  { icon: Languages, label: "Languages", val: tutor.languages.join(", ") },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-muted/60 p-4">
                    <item.icon className="h-4 w-4 text-primary" />
                    <div className="mt-2 text-xs text-muted-foreground">{item.label}</div>
                    <div className="font-semibold">{item.val}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-border/60">
              <h2 className="font-display text-lg font-semibold">Skills & Subjects</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {tutor.subjects.map((subject) => (
                  <Badge key={subject} className="bg-primary/10 text-primary border-0 hover:bg-primary/15 px-3 py-1.5">{subject}</Badge>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-border/60">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Reviews</h2>
                <span className="text-sm text-muted-foreground">{tutor.reviews} reviews</span>
              </div>
              <div className="mt-5 space-y-5">
                {tutor.reviews_list.map((review, index) => (
                  <div key={index} className="flex gap-4 border-b border-border last:border-0 pb-5 last:pb-0">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{review.name}</div>
                        <div className="flex">{[...Array(review.rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />)}</div>
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">{review.text}</p>
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
                {["M","T","W","T","F","S","S"].map((dayLetter, index) => {
                  const dayName = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][index];
                  const isFree = tutor.availability.includes(dayName);
                  return (
                    <div key={dayLetter} className="text-center">
                      <div className="text-xs text-muted-foreground">{dayLetter}</div>
                      <div className={`mt-1.5 h-9 rounded-lg grid place-items-center text-xs font-medium ${isFree ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/50"}`}>
                        {isFree ? "Free" : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 space-y-2">
                {tutor.timeSlots.map((slot) => (
                  <button key={slot} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium hover:border-primary hover:bg-primary/5 transition">
                    {slot}
                  </button>
                ))}
              </div>
              <Button className="mt-5 w-full bg-gradient-primary shadow-glow">Book a Session</Button>
            </Card>

            <Card className="p-6 border-border/60 bg-gradient-soft">
              <h3 className="font-display font-semibold">Why book with {tutor.name.split(" ")[0]}</h3>
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
