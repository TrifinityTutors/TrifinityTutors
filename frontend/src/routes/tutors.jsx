import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, MapPin, Star, Heart, ArrowRight, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { tutorsData } from "@/data/tutors";

export const Route = createFileRoute("/tutors")({
  component: TutorsPage,
  head: () => ({ meta: [{ title: "Browse Tutors — Trifinity" }, { name: "description", content: "Browse verified college tutors by subject, rating, location, and price." }] }),
});

const tutors = tutorsData;

const subjectList = ["Mathematics","Physics","Chemistry","Biology","Computer Science","English","Economics","Languages"];

function TutorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [ratingFilters, setRatingFilters] = useState([]);
  const [price, setPrice] = useState([100]);
  const [sortOption, setSortOption] = useState("best");

  const handleSearch = () => {
    setSearchTerm(searchQuery.trim());
    setLocationTerm(locationQuery.trim());
  };

  const toggleSubject = (subject) => {
    setSelectedSubjects((prevSubjects) =>
      prevSubjects.includes(subject)
        ? prevSubjects.filter((item) => item !== subject)
        : [...prevSubjects, subject]
    );
  };

  const toggleRatingFilter = (rating) => {
    setRatingFilters((prevRatings) =>
      prevRatings.includes(rating)
        ? prevRatings.filter((item) => item !== rating)
        : [...prevRatings, rating]
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setLocationQuery("");
    setSearchTerm("");
    setLocationTerm("");
    setSelectedSubjects([]);
    setRatingFilters([]);
    setPrice([100]);
    setSortOption("best");
  };

  const filteredTutors = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();
    const normalizedLocation = locationTerm.toLowerCase();
    const maxPrice = price[0];

    return tutors
      .filter((tutor) => {
        if (normalizedSearch) {
          const nameMatch = tutor.name.toLowerCase().includes(normalizedSearch);
          const subjectMatch = tutor.subject.toLowerCase().includes(normalizedSearch);
          const tagsMatch = tutor.subjects.some((tag) => tag.toLowerCase().includes(normalizedSearch));
          if (!(nameMatch || subjectMatch || tagsMatch)) return false;
        }

        if (normalizedLocation && !tutor.location.toLowerCase().includes(normalizedLocation)) {
          return false;
        }

        if (selectedSubjects.length > 0) {
          const matchesSelectedSubject = selectedSubjects.some((subject) =>
            tutor.subjects.some((tag) => tag.toLowerCase().includes(subject.toLowerCase()))
          );
          if (!matchesSelectedSubject) return false;
        }

        if (ratingFilters.length > 0) {
          const minRating = Math.min(...ratingFilters);
          if (tutor.rating < minRating) return false;
        }

        if (tutor.price > maxPrice) {
          return false;
        }

        return true;
      })
      .slice()
      .sort((a, b) => {
        if (sortOption === "low") return a.price - b.price;
        if (sortOption === "high") return b.price - a.price;
        if (sortOption === "exp") return b.exp - a.exp;
        if (sortOption === "rating") return b.rating - a.rating;
        return a.id - b.id;
      });
  }, [searchTerm, locationTerm, selectedSubjects, ratingFilters, price, sortOption]);

  return (
    <>
      <div className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Find your perfect tutor</h1>
          <p className="mt-2 text-muted-foreground">2,800+ verified tutors ready to help you succeed.</p>
          <div className="mt-6 glass-strong rounded-2xl p-2 shadow-soft flex flex-col gap-2 md:flex-row">
            <div className="flex flex-1 items-center gap-3 px-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
                placeholder="Search subject or tutor name"
              />
            </div>
            <div className="h-px md:h-auto md:w-px bg-border" />
            <div className="flex flex-1 items-center gap-3 px-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <Input
                value={locationQuery}
                onChange={(event) => setLocationQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
                placeholder="Location"
              />
            </div>
            <Button className="bg-gradient-primary shadow-glow" type="button" onClick={handleSearch}>Search</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6">
            <Card className="p-6 border-border/60">
              <div className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /><h3 className="font-display font-semibold">Filters</h3></div>
              <div className="mt-6">
                <h4 className="text-sm font-semibold">Subjects</h4>
                <div className="mt-3 space-y-2.5">
                  {subjectList.map((s) => (
                    <label key={s} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <Checkbox checked={selectedSubjects.includes(s)} onCheckedChange={() => toggleSubject(s)} /> {s}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-semibold">Max hourly price</h4>
                <Slider value={price} onValueChange={setPrice} min={5} max={100} step={1} className="mt-4" />
                <div className="mt-2 text-xs text-muted-foreground">Up to <span className="font-semibold text-foreground">${price[0]}/hr</span></div>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-semibold">Rating</h4>
                <div className="mt-3 space-y-2.5">
                  {[5,4,3].map((r) => (
                    <label key={r} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <Checkbox checked={ratingFilters.includes(r)} onCheckedChange={() => toggleRatingFilter(r)} />
                      <div className="flex">{[...Array(r)].map((_,i) => <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />)}</div>
                      <span className="text-muted-foreground">&nbsp;{r} & up</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button className="mt-6 w-full bg-gradient-primary" type="button" onClick={resetFilters}>Reset Filters</Button>
            </Card>
          </aside>

          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{filteredTutors.length}</span> tutors found</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" /> Sort: <span className="font-medium text-foreground">Best Match</span>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTutors.length > 0 ? filteredTutors.map((t) => <TutorCard key={t.id} t={t} />) : (
                <div className="col-span-full rounded-3xl border border-dashed border-border/70 bg-card p-10 text-center text-muted-foreground">
                  No tutors matched your search and filters. Try adjusting your search or removing filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TutorCard({ t }) {
  return (
    <Card className="group relative overflow-hidden border-border/60 p-6 hover-lift">
      <button className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-card border border-border text-muted-foreground hover:text-rose-500 transition">
        <Heart className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-4">
        <div className={`relative h-16 w-16 rounded-2xl bg-gradient-to-br ${t.grad} grid place-items-center text-white font-display text-xl font-bold shadow-glow`}>
          {t.name.split(" ").map(n=>n[0]).join("")}
          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-success ring-2 ring-card" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold truncate">{t.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{t.subject} Tutor</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="font-semibold">{t.rating}</span>
            <span className="text-muted-foreground">({t.reviews})</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {t.tags.map(tag => <Badge key={tag} variant="secondary" className="font-normal">{tag}</Badge>)}
      </div>
      <div className="mt-5 flex items-center justify-between text-sm">
        <div className="text-muted-foreground"><MapPin className="inline h-3.5 w-3.5 mr-1" />{t.location}</div>
        <div className="text-muted-foreground">{t.exp} yrs exp</div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div>
          <span className="font-display text-2xl font-bold">${t.price}</span>
          <span className="text-sm text-muted-foreground">/hr</span>
        </div>
        <Button asChild className="bg-gradient-primary shadow-glow group-hover:scale-105 transition-transform">
          <Link to="/tutors/$id" params={{ id: String(t.id) }}>Book Now <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
    </Card>
  );
}
