import { Link } from "react-router-dom";
import { GraduationCap, Twitter, Linkedin, Instagram, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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
            <div className="mt-6 flex gap-3">
              {[Twitter, Linkedin, Instagram, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-blue-600 hover:text-white hover:border-blue-600"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
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
    </footer>
  );
}
