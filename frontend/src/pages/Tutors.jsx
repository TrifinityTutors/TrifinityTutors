import { useState } from "react";
import { Search, MapPin, Star, Heart, ArrowRight, Filter, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const gradients = [
  "from-blue-400 to-indigo-500",
  "from-rose-400 to-pink-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-blue-500",
];

const tutors = Array.from({ length: 9 }).map((_, i) => ({
  id: i + 1,
  name: ["Ananya Rao", "Rahul Verma", "Sara Iqbal", "Daniel Cohen", "Mei Lin", "Kabir Singh", "Amelia Brown", "Jonas Müller", "Aisha Patel"][i],
  subject: ["Mathematics", "Physics", "English Lit", "Computer Science", "Chemistry", "Calculus", "Biology", "Economics", "Spanish"][i],
  tags: [["Algebra", "Calculus"], ["Mechanics", "Waves"], ["Essays", "Grammar"], ["Python", "DSA"], ["Organic", "Inorganic"], ["AP", "SAT"], ["Cell Bio", "Genetics"], ["Micro", "Macro"], ["A1-C2", "Conversation"]][i],
  rating: (4.6 + (i % 5) * 0.08).toFixed(2),
  reviews: 80 + i * 23,
  price: 18 + i * 4,
  exp: 2 + (i % 6),
  location: ["Bangalore", "Mumbai", "Delhi", "Remote", "Hyderabad", "Pune", "Online", "Online", "Chennai"][i],
  grad: gradients[i % gradients.length],
}));

const subjectList = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "Economics", "Languages"];

function Tutors() {
  const [price, setPrice] = useState([50]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="border-b border-gray-200 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold sm:text-4xl text-gray-900">Find your perfect tutor</h1>
          <p className="mt-2 text-gray-600">2,800+ verified tutors ready to help you succeed.</p>
          <div className="mt-6 rounded-2xl p-2 shadow-lg bg-white border border-gray-200 flex flex-col gap-2 md:flex-row">
            <div className="flex flex-1 items-center gap-3 px-3">
              <Search className="h-5 w-5 text-gray-400" />
              <Input className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0" placeholder="Search subject or tutor name" />
            </div>
            <div className="h-px md:h-auto md:w-px bg-gray-200" />
            <div className="flex flex-1 items-center gap-3 px-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <Input className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0" placeholder="Location" />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">Search</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6">
            <Card className="p-6 border border-gray-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <h3 className="font-semibold text-gray-900">Filters</h3>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900">Subjects</h4>
                <div className="mt-3 space-y-2.5">
                  {subjectList.map((s) => (
                    <label key={s} className="flex items-center gap-2.5 text-sm cursor-pointer text-gray-700 hover:text-gray-900">
                      <input type="checkbox" className="w-4 h-4" /> {s}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900">Max hourly price</h4>
                <input type="range" min="5" max="100" value={price[0]} onChange={(e) => setPrice([parseInt(e.target.value)])} className="mt-4 w-full" />
                <div className="mt-2 text-xs text-gray-600">Up to <span className="font-semibold text-gray-900">${price[0]}/hr</span></div>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900">Rating</h4>
                <div className="mt-3 space-y-2.5">
                  {[5, 4, 3].map(r => (
                    <label key={r} className="flex items-center gap-2.5 text-sm cursor-pointer text-gray-700 hover:text-gray-900">
                      <input type="checkbox" className="w-4 h-4" /> <div className="flex">{[...Array(r)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}</div> & up
                    </label>
                  ))}
                </div>
              </div>
              <Button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white">Apply Filters</Button>
            </Card>
          </aside>

          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">{tutors.length}</span> tutors found</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" /> Sort: <span className="font-medium text-gray-900">Best Match</span>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {tutors.map(t => <TutorCard key={t.id} t={t} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TutorCard({ t }) {
  return (
    <Card className="group relative overflow-hidden border border-gray-200 p-6 hover:shadow-lg transition-all">
      <button className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 transition">
        <Heart className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-4">
        <div className={`relative h-16 w-16 rounded-2xl bg-gradient-to-br ${t.grad} grid place-items-center text-white font-bold text-xl shadow-lg`}>
          {t.name.split(" ").map(n => n[0]).join("")}
          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 ring-2 ring-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{t.name}</h3>
          <p className="text-sm text-gray-600 truncate">{t.subject} Tutor</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900">{t.rating}</span>
            <span className="text-gray-600">({t.reviews})</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {t.tags.map(tag => <Badge key={tag} variant="outline" className="font-normal">{tag}</Badge>)}
      </div>
      <div className="mt-5 flex items-center justify-between text-sm">
        <div className="text-gray-600"><MapPin className="inline h-3.5 w-3.5 mr-1" />{t.location}</div>
        <div className="text-gray-600">{t.exp} yrs exp</div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4">
        <div>
          <span className="text-2xl font-bold text-gray-900">${t.price}</span>
          <span className="text-sm text-gray-600">/hr</span>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white group-hover:scale-105 transition-transform">
          Book Now <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

export default Tutors;
