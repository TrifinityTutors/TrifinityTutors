import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, MapPin, Star, Heart, ArrowRight, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

const gradients = [
  "from-blue-400 to-indigo-500",
  "from-rose-400 to-pink-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-blue-500",
];

const subjectList = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Economics",
  "Languages",
];

const ratingOptions = [5, 4, 3];

const normalize = (value) => String(value || "").trim().toLowerCase();

const doesMatchSearch = (tutor, term) => {
  if (!term) return true;
  const normalizedTerm = normalize(term);
  return [
    tutor.name,
    tutor.subject,
    tutor.location,
    tutor.expertise,
    tutor.bio,
    tutor.about,
    tutor.description,
    ...(tutor.tags || []),
  ].some((field) => normalize(field).includes(normalizedTerm));
};

const doesMatchSubjects = (tutor, selectedSubjects) => {
  if (selectedSubjects.length === 0) return true;
  const subjectText = normalize(tutor.subject);
  const tagText = normalize((tutor.tags || []).join(" "));
  return selectedSubjects.some((subject) => {
    const normalizedSubject = normalize(subject);
    return subjectText.includes(normalizedSubject) || tagText.includes(normalizedSubject);
  });
};

const doesMatchRatings = (tutor, selectedRatings) => {
  if (selectedRatings.length === 0) return true;
  const tutorRating = Number(tutor.rating) || 0;
  return selectedRatings.some((threshold) => tutorRating >= threshold);
};

function Tutors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [savedTutorIds, setSavedTutorIds] = useState([]);
  const [savingTutorIds, setSavingTutorIds] = useState([]);
  const { user, token, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const initialSearch = searchParams.get("search") || "";
    const initialLocation = searchParams.get("location") || "";
    setSearchTerm(initialSearch);
    setLocation(initialLocation);
  }, [searchParams]);

  useEffect(() => {
    if (user?.savedTutors) {
      setSavedTutorIds(
        user.savedTutors.map((tutor) => String(tutor._id || tutor.id || tutor))
      );
    } else {
      setSavedTutorIds([]);
    }
  }, [user]);

  useEffect(() => {
    async function fetchTutors() {
      try {
        const response = await fetch("http://localhost:5000/api/tutors");
        const data = await response.json();

        console.log("Fetched tutors:", data);

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch tutors");
        }

        setTutors(
          data.map((t, index) => ({
            ...t,
            id: t._id || index,
            name: t.name || t.fullName || "Tutor",
            subject: t.subject || (t.subjects?.[0] || "Tutor"),
            tags: t.subjects?.slice(0, 3) || [t.subject || "Tutoring"],
            rating: typeof t.rating === "number" ? t.rating.toFixed(2) : t.rating || "4.95",
            reviews: t.reviews || 0,
            price: t.hourlyRate || t.price || 0,
            exp: t.experience || 0,
            location: t.locality || t.city || t.location || "Remote",
            profilePhoto: t.profilePhoto || t.photo || "/default-avatar.svg",
            grad: gradients[index % gradients.length],
          }))
        );
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTutors();
  }, []);

  const filteredTutors = useMemo(() => {
    return tutors.filter((tutor) => {
      const matchesSearch = doesMatchSearch(tutor, searchTerm);
      const matchesLocation = normalize(tutor.location).includes(normalize(location));
      const matchesSubjects = doesMatchSubjects(tutor, selectedSubjects);
      const matchesRating = doesMatchRatings(tutor, selectedRatings);
      const matchesPrice = tutor.price <= maxPrice;

      return matchesSearch && matchesLocation && matchesSubjects && matchesRating && matchesPrice;
    });
  }, [tutors, searchTerm, location, selectedSubjects, selectedRatings, maxPrice]);

  const handleSubjectToggle = (subject) => {
    setSelectedSubjects((current) =>
      current.includes(subject)
        ? current.filter((item) => item !== subject)
        : [...current, subject]
    );
  };

  const handleRatingToggle = (rating) => {
    setSelectedRatings((current) =>
      current.includes(rating)
        ? current.filter((item) => item !== rating)
        : [...current, rating]
    );
  };

  const handleSearchClick = () => {
    const params = {};
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (location.trim()) params.location = location.trim();
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setLocation("");
    setSelectedSubjects([]);
    setSelectedRatings([]);
    setMaxPrice(10000);
    setSearchParams({});
  };

  const handleToggleFavorite = async (tutorId, currentlySaved) => {
    if (!token || !user) {
      return navigate("/auth/login");
    }

    if (user.role !== "student") {
      return alert("Only students can save tutors.");
    }

    if (savingTutorIds.includes(tutorId)) {
      return;
    }

    setSavingTutorIds((current) => [...current, tutorId]);
    const method = currentlySaved ? "DELETE" : "POST";

    try {
      const response = await fetch(`http://localhost:5000/api/students/save-tutor/${tutorId}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to update saved tutors.");
      }

      const updatedIds = (data.savedTutors || []).map((tutor) => String(tutor._id || tutor.id || tutor));
      setSavedTutorIds(updatedIds);
      if (refreshProfile) {
        refreshProfile();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Could not update favorites. Please try again.");
    } finally {
      setSavingTutorIds((current) => current.filter((id) => id !== tutorId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold sm:text-4xl text-gray-900">Find your perfect tutor</h1>
          <p className="mt-2 text-gray-600">Browse verified tutors with expert profiles, transparent pricing, and student reviews.</p>
          <div className="mt-6 rounded-2xl p-2 shadow-lg bg-white border border-gray-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-3 px-3 bg-white rounded-2xl">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
                placeholder="Search subject, tutor name or skill"
              />
            </div>
            <div className="flex flex-1 items-center gap-3 px-3 bg-white rounded-2xl">
              <MapPin className="h-5 w-5 text-gray-400" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
                placeholder="Location"
              />
            </div>
            <Button onClick={handleSearchClick} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              Search
            </Button>
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
                  {subjectList.map((subject) => (
                    <label key={subject} className="flex items-center gap-2.5 text-sm cursor-pointer text-gray-700 hover:text-gray-900">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject)}
                        onChange={() => handleSubjectToggle(subject)}
                        className="w-4 h-4"
                      />
                      {subject}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900">Max hourly price</h4>
                <input
                  type="range"
                  min="5"
                  max="10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                  className="mt-4 w-full"
                />
                <div className="mt-2 text-xs text-gray-600">
                  Up to <span className="font-semibold text-gray-900">${maxPrice}/hr</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900">Rating</h4>
                <div className="mt-3 space-y-2.5">
                  {ratingOptions.map((rating) => (
                    <label key={rating} className="flex items-center gap-2.5 text-sm cursor-pointer text-gray-700 hover:text-gray-900">
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(rating)}
                        onChange={() => handleRatingToggle(rating)}
                        className="w-4 h-4"
                      />
                      <div className="flex">{[...Array(rating)].map((_, index) => (
                        <Star key={index} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      ))}</div>
                      <span className="ml-1">&amp; up</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={handleSearchClick} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  Apply Filters
                </Button>
                <Button onClick={handleClearFilters} variant="secondary" className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50">
                  Clear
                </Button>
              </div>
            </Card>
          </aside>

          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{filteredTutors.length}</span> tutors found
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" /> Sort: <span className="font-medium text-gray-900">Best Match</span>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="h-72 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
            ) : filteredTutors.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-gray-700">
                <p className="text-xl font-semibold text-gray-900">No tutors found</p>
                <p className="mt-2 text-sm text-gray-600">Try changing filters or search terms.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTutors.map((t) => (
                  <TutorCard
                    key={t.id}
                    t={t}
                    isSaved={savedTutorIds.includes(String(t.id || t._id))}
                    onToggleFavorite={handleToggleFavorite}
                    isSaving={savingTutorIds.includes(String(t.id || t._id))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TutorCard({ t, isSaved, onToggleFavorite, isSaving }) {
  const iconClass = isSaved ? "text-red-500" : "text-gray-400 group-hover:text-red-500";

  return (
    <Card className="group relative overflow-hidden border border-gray-200 p-6 hover:shadow-lg transition-all">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite?.(t.id || t._id, isSaved);
        }}
        disabled={isSaving}
        className={`absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white border border-gray-200 shadow-sm transition ${isSaving ? "opacity-70 cursor-wait" : "hover:bg-red-50"}`}
        aria-label={isSaved ? "Remove saved tutor" : "Save tutor"}
      >
        <Heart className={`h-4 w-4 transition-colors ${iconClass}`} fill={isSaved ? "currentColor" : "none"} />
      </button>
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-slate-200 shadow-sm">
          <img
            src={t.profilePhoto || t.photo || "/default-avatar.svg"}
            alt={t.name}
            onError={(event) => {
              if (!event.currentTarget.src.endsWith("/default-avatar.svg")) {
                event.currentTarget.src = "/default-avatar.svg";
              }
            }}
            className="h-full w-full object-cover"
          />
          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{t.name}</h3>
          <p className="text-sm text-gray-600 truncate">{t.subject} Tutor</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900">{t.rating}</span>
            <span>({t.reviews})</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {t.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="font-normal">{tag}</Badge>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{t.location}</div>
        <div>{t.exp} yrs exp</div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4">
        <div>
          <span className="text-2xl font-bold text-gray-900">${t.price}</span>
          <span className="text-sm text-gray-600">/hr</span>
        </div>
        <Link
          to={`/tutors/${t.id}`}
          className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          View Profile <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}

export default Tutors

