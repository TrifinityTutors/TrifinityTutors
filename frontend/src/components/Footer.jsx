import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-200 bg-gradient-soft text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white/80 p-8 shadow-soft ring-1 ring-slate-200/80 backdrop-blur-xl">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg">Trifinity Tutors</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-gray-600">
              Connecting passionate college tutors with students who want to learn.
              Trusted, verified, and tailored to your goals.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button size="sm" asChild>
                <Link to="/tutors">Browse Tutors</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth/signup">Become a Tutor</Link>
              </Button>
            </div>
          </div>
          {[
            { title: "Product", items: ["Find Tutors", "Become a Tutor", "Pricing", "How it works"] },
            { title: "Company", items: ["About", "Careers", "Blog", "Contact"] },
            { title: "Legal", items: ["Privacy", "Terms", "Cookies", "Trust"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-sm">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-gray-200 pt-6 text-xs text-gray-600 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Trifinity Tutors. All rights reserved.</p>
          <p>Crafted with care for learners and educators worldwide.</p>
        </div>
      </div>
    </div>
    </footer>
  );
}
