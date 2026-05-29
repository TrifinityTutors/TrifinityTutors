import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-background/80 border-t border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-[2rem] bg-white/85 p-10 shadow-glow ring-1 ring-slate-200/80 backdrop-blur-xl lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Trifinity</p>
                <p className="text-xl font-semibold text-slate-900">Tutors</p>
              </div>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-7 text-slate-600">
              A premium tutoring experience with verified educators, modern scheduling,
              and meaningful student outcomes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="sm" asChild className="rounded-full px-5 py-2.5 shadow-sm">
                <Link to="/tutors">Browse Tutors</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="rounded-full px-5 py-2.5">
                <Link to="/auth/signup">Become a Tutor</Link>
              </Button>
            </div>
          </div>

          {[
            { title: "Product", items: ["Find Tutors", "Tutor Dashboard", "Student Dashboard", "Checkout"] },
            { title: "Company", items: ["About", "Careers", "Blog", "Contact"] },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{section.title}</h4>
              <ul className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-600 transition hover:text-slate-900">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200/70 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Trifinity Tutors. All rights reserved.</p>
          <p>Designed for learners and tutors who demand better.</p>
        </div>
      </div>
    </footer>
  );
}
