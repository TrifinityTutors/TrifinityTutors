import { createFileRoute } from "@tanstack/react-router";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Search, MapPin, ArrowRight, Sparkles, Shield, Clock, Award,
  Star, Calculator, FlaskConical, Code2, Languages, Music, Palette,
  BookOpen, ChevronDown, ChevronLeft, ChevronRight, Check, Quote,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroImg from "@/assets/hero-illustration.jpg";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const subjects = [
  { icon: Calculator, name: "Mathematics", count: "1,240 tutors", color: "from-blue-500/20 to-indigo-500/20" },
  { icon: FlaskConical, name: "Science", count: "890 tutors", color: "from-cyan-500/20 to-teal-500/20" },
  { icon: Code2, name: "Programming", count: "620 tutors", color: "from-violet-500/20 to-purple-500/20" },
  { icon: Languages, name: "Languages", count: "740 tutors", color: "from-rose-500/20 to-pink-500/20" },
  { icon: Music, name: "Music", count: "320 tutors", color: "from-amber-500/20 to-orange-500/20" },
  { icon: Palette, name: "Art & Design", count: "410 tutors", color: "from-emerald-500/20 to-green-500/20" },
  { icon: BookOpen, name: "Literature", count: "560 tutors", color: "from-sky-500/20 to-blue-500/20" },
  { icon: Award, name: "Test Prep", count: "980 tutors", color: "from-fuchsia-500/20 to-purple-500/20" },
];

const steps = [
  { n: "01", title: "Tell us what you need", desc: "Share your subject, level, schedule, and learning goals in under a minute." },
  { n: "02", title: "Match with verified tutors", desc: "Browse handpicked profiles, ratings, and reviews from real students." },
  { n: "03", title: "Book & learn confidently", desc: "Schedule sessions at home or online and pay securely after each class." },
];

const benefits = [
  { icon: Shield, title: "Verified Tutors", desc: "Every tutor is ID-verified and background-checked before joining." },
  { icon: Clock, title: "Flexible Scheduling", desc: "Book sessions when it suits you — evenings, weekends, anytime." },
  { icon: Sparkles, title: "Personalized Learning", desc: "Tailored 1-on-1 sessions designed around your unique goals." },
  { icon: Award, title: "Money-back Guarantee", desc: "Not happy with your first session? Get a full refund, no questions." },
];

const testimonials = [
  { name: "Priya Sharma", role: "Grade 12 Student", text: "My math grades jumped two letters in three months. My tutor genuinely cared about my progress.", rating: 5 },
  { name: "Arjun Mehta", role: "Parent", text: "Finding a trustworthy tutor for my daughter was effortless. The vetting process gave us real peace of mind.", rating: 5 },
  { name: "Sara Khan", role: "Engineering Student", text: "Booked a senior from IIT for circuits — best decision ever. The platform is beautifully simple.", rating: 5 },
];

const faqs = [
  { q: "How are tutors verified?", a: "Every tutor uploads government-issued ID, academic transcripts, and passes a video interview before going live." },
  { q: "How much do sessions cost?", a: "Tutors set their own rates, typically between $10 and $50 per hour depending on subject and experience." },
  { q: "Can I cancel a booking?", a: "Yes — cancel up to 12 hours before your session for a full refund. Late cancellations follow our fair-use policy." },
  { q: "Do you offer online sessions?", a: "Absolutely. Many tutors offer both in-person and online sessions with built-in video and whiteboard tools." },
  { q: "Is there a fee to join as a tutor?", a: "Joining is free. We take a small commission only when you complete paid sessions." },
];

function LandingPage() {
  return (
    <SiteLayout>
      <Hero />
      <TrustedBy />
      <Subjects />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <FAQ />
      <CTABand />
    </SiteLayout>
  );
}

export default LandingPage;

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-mesh">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center animate-fade-up">
          <Badge className="w-fit gap-1.5 border-0 bg-primary/10 text-primary hover:bg-primary/15">
            <Sparkles className="h-3.5 w-3.5" /> Trusted by 50,000+ learners
          </Badge>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Find the perfect <span className="text-gradient-primary">tutor near you</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Trifinity connects students with passionate college tutors for personalized,
            affordable learning — at home or online.
          </p>
          <SearchBar />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" asChild className="bg-gradient-primary shadow-glow hover:opacity-95">
              <Link to="/tutors">Find a Tutor <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-card/60 backdrop-blur">
              <Link to="/register-tutor">Become a Tutor</Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className={`h-8 w-8 rounded-full ring-2 ring-background bg-gradient-to-br ${
                  ["from-blue-300 to-indigo-400","from-rose-300 to-pink-400","from-emerald-300 to-teal-400","from-amber-300 to-orange-400"][i-1]
                }`} />
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_,i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}
              <span className="ml-1 font-medium text-foreground">4.9</span>
              <span>· 12k+ reviews</span>
            </div>
          </div>
        </div>
        <div className="relative flex items-center justify-center animate-fade-in">
          <div className="absolute inset-0 -z-10 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
          <div className="relative glass-strong rounded-3xl p-3 shadow-soft animate-float">
            <img src={heroImg} alt="Students learning with Trifinity tutors" width={1280} height={1024}
              className="rounded-2xl w-full max-w-xl" />
          </div>
          <FloatingCard className="absolute -left-2 top-6 hidden sm:flex" icon={<Check className="h-4 w-4 text-success" />} label="Verified Tutor" sub="Background checked" />
          <FloatingCard className="absolute -right-2 bottom-6 hidden sm:flex" icon={<Star className="h-4 w-4 fill-warning text-warning" />} label="4.9 / 5.0" sub="Average rating" />
        </div>
      </div>
    </section>
  );
}

function FloatingCard({ className, icon, label, sub }) {
  return (
    <div className={`glass-strong rounded-2xl px-4 py-3 shadow-soft flex items-center gap-3 ${className}`}>
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-card">{icon}</div>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

function SearchBar() {
  return (
    <div className="mt-7 glass-strong rounded-2xl p-2 shadow-soft flex flex-col gap-2 sm:flex-row">
      <div className="flex flex-1 items-center gap-3 px-3">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0" placeholder="Subject (e.g. Calculus)" />
      </div>
      <div className="h-px sm:h-auto sm:w-px bg-border" />
      <div className="flex flex-1 items-center gap-3 px-3">
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <Input className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0" placeholder="Location or 'Online'" />
      </div>
      <Button size="lg" className="bg-gradient-primary shadow-glow hover:opacity-95">Search</Button>
    </div>
  );
}

function TrustedBy() {
  const logos = ["Harvard", "Stanford", "MIT", "Oxford", "IIT", "Cambridge"];
  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">
          Trusted by students from leading universities
        </p>
        <div className="mt-6 grid grid-cols-3 gap-6 sm:grid-cols-6">
          {logos.map(l => (
            <div key={l} className="text-center font-display text-lg font-semibold text-muted-foreground/70 hover:text-foreground transition-colors">
              {l}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Subjects() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Popular Subjects" title="Find expert help in any subject" desc="From algebra to artificial intelligence — our tutors cover hundreds of subjects." />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {subjects.map((s, i) => (
          <Card key={s.name} className="group relative overflow-hidden border-border/60 p-6 hover-lift cursor-pointer" style={{ animationDelay: `${i*60}ms` }}>
            <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <s.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold">{s.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.count}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0">
              Explore <ArrowRight className="h-4 w-4" />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bg-gradient-soft py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="How it Works" title="Three simple steps to better grades" desc="From discovery to your first session in less than 24 hours." />
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative glass rounded-3xl p-8 hover-lift">
              <div className="font-display text-5xl font-bold text-gradient-primary">{s.n}</div>
              <h3 className="mt-3 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Why Trifinity" title="A premium tutoring experience" desc="We built Trifinity on trust, quality, and care for every learner." />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <Card key={b.title} className="border-border/60 p-6 hover-lift">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <b.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold">{b.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const [i, setI] = useState(0);
  const t = testimonials[i];
  return (
    <section className="bg-gradient-soft py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Testimonials" title="Loved by students and parents" />
        <Card className="mt-10 border-border/60 p-8 md:p-12 relative glass-strong">
          <Quote className="absolute right-8 top-8 h-12 w-12 text-primary/15" />
          <div className="flex gap-1">
            {[...Array(t.rating)].map((_,k) => <Star key={k} className="h-5 w-5 fill-warning text-warning" />)}
          </div>
          <p className="mt-5 font-display text-xl md:text-2xl leading-relaxed">"{t.text}"</p>
          <div className="mt-7 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-300 to-indigo-400" />
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.role}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setI((i-1+testimonials.length)%testimonials.length)} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card hover:bg-accent transition">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setI((i+1)%testimonials.length)} className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 transition">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="FAQ" title="Frequently asked questions" />
      <div className="mt-10 space-y-3">
        {faqs.map((f, i) => (
          <Card key={i} className="border-border/60 overflow-hidden">
            <button onClick={() => setOpen(open===i ? null : i)} className="flex w-full items-center justify-between px-6 py-5 text-left">
              <span className="font-display font-semibold">{f.q}</span>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open===i ? "rotate-180" : ""}`} />
            </button>
            {open===i && (
              <div className="px-6 pb-5 text-sm text-muted-foreground animate-fade-in">{f.a}</div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}

function CTABand() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 md:p-16 text-primary-foreground shadow-glow">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30 mix-blend-overlay" />
        <div className="relative max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Start learning with Trifinity today</h2>
          <p className="mt-3 text-primary-foreground/85">
            Join 50,000+ learners who trust Trifinity for personalized, premium tutoring.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-transparent border-white/40 text-primary-foreground hover:bg-white/10">
              <Link to="/tutors">Browse Tutors</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, desc }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Badge className="border-0 bg-primary/10 text-primary hover:bg-primary/15">{eyebrow}</Badge>
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {desc && <p className="mt-3 text-muted-foreground">{desc}</p>}
    </div>
  );
}
