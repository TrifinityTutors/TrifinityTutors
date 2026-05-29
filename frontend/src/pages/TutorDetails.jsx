import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Star, MapPin, MessageSquare, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const dayLetters = ["M", "T", "W", "T", "F", "S", "S"];
const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const defaultSlots = ["10:00 AM - 11:00 AM", "2:00 PM - 3:00 PM", "6:30 PM - 7:30 PM"];

const getTutorPhoto = (tutor) => {
  return tutor?.profilePhoto || tutor?.photo || tutor?.avatar || tutor?.image || "";
};

const getTutorInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

function TutorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  const isStudentLoggedIn = (() => {
    const student = localStorage.getItem("student");
    if (student) return true;
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return user?.role === "student";
    } catch {
      return false;
    }
  })();

  const redirectToStudentLogin = () => {
    navigate("/auth/login", { state: { from: location.pathname } });
  };

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/tutors/profile/${id}`);
        setTutor(response.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Tutor profile not found. Please pick another tutor.");
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [id]);

  const profilePhoto = getTutorPhoto(tutor);
  const initials = getTutorInitials(tutor?.name || "");
  const price = tutor?.hourlyRate ?? tutor?.price ?? 0;
  const languages = Array.isArray(tutor?.languages) && tutor.languages.length
    ? tutor.languages.join(", ")
    : Array.isArray(tutor?.subjects) && tutor.subjects.length
      ? tutor.subjects.slice(0, 3).join(", ")
      : "English";
  const college = tutor?.education || tutor?.locality || "Remote";
  const subjectLabel = tutor?.subject || (Array.isArray(tutor?.subjects) ? tutor.subjects[0] : "Tutoring");
  const availability = Array.isArray(tutor?.availability) ? tutor.availability : [];
  const slots = Array.isArray(tutor?.timeSlots) && tutor.timeSlots.length ? tutor.timeSlots : defaultSlots;
  const skillTags = Array.isArray(tutor?.tags) && tutor.tags.length ? tutor.tags : (Array.isArray(tutor?.subjects) ? tutor.subjects.slice(0, 6) : [subjectLabel]);
  const isVerified = tutor?.verificationStatus === "verified" || tutor?.status === "approved";

  const handleBookSession = () => {
    if (!isStudentLoggedIn) {
      redirectToStudentLogin();
      return;
    }
    if (!selectedSlot) {
      setBookingMessage("Please select an available slot before booking.");
      return;
    }
    navigate(`/booking/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-20 text-gray-700">Loading tutor profile…</div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <p className="text-xl font-semibold text-slate-900">Tutor not found</p>
          <p className="mt-3 text-slate-600">{error || "The tutor profile you requested does not exist."}</p>
          <Link
            to="/tutors"
            className="mt-6 inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            Back to tutors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center gap-3 text-sm text-slate-600">
          <Link to="/tutors" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" /> Back to tutors
          </Link>
        </div>

        <Card className="overflow-hidden border border-slate-200 shadow-sm">
          <div className="h-36 bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500" />
          <div className="px-6 pb-6 pt-6 sm:px-10">
            <div className="-mt-16 flex flex-col gap-6 rounded-[2rem] bg-white p-6 shadow-xl sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-slate-100 shadow-lg">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={tutor.name}
                      onError={(event) => {
                        if (!event.currentTarget.src.endsWith("/default-avatar.svg")) {
                          event.currentTarget.src = "/default-avatar.svg";
                        }
                      }}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 to-indigo-500 text-4xl font-bold text-white">
                      {initials || "TT"}
                    </div>
                  )}
                  <span className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-emerald-500 ring-3 ring-white" />
                </div>
                <div className="sm:pb-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-semibold text-slate-900">{tutor.name}</h1>
                    {isVerified && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{subjectLabel} Tutor · {college}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1 text-slate-900 font-medium">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{(tutor.rating ?? 4.95).toFixed(2)}</span>
                      <span className="text-slate-500">({tutor.reviews ?? 0} reviews)</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />{tutor.locality || "Remote"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" />{tutor.experience ?? 0} yrs exp
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-3xl bg-slate-50 p-5 shadow-sm ring-1 ring-slate-200 sm:w-[320px]">
                <div className="text-right">
                  <div className="text-4xl font-semibold text-slate-900">
                    ₹{price}
                    <span className="text-base font-medium text-slate-500">/hr</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button onClick={handleBookSession} className="rounded-full bg-sky-600 px-6 py-3 text-white transition hover:bg-sky-700">
                    Book session
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-slate-200 px-6 py-3 text-slate-900 hover:bg-slate-100"
                    onClick={() => {
                      if (!isStudentLoggedIn) {
                        redirectToStudentLogin();
                        return;
                      }
                      navigate(`/messages/${id}`);
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card className="p-6 sm:p-8 border border-slate-200 shadow-sm rounded-3xl">
              <h2 className="text-2xl font-semibold text-slate-900">About {tutor.name?.split(" ")[0] || "this tutor"}</h2>
              <p className="mt-4 text-slate-600 leading-relaxed text-base">{tutor.bio || "This tutor crafts modern learning experiences, clear lesson plans, and real student outcomes."}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Education", value: tutor.education || "N/A" },
                  { label: "Experience", value: `${tutor.experience ?? 0}+ years` },
                  { label: "Languages", value: languages },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">{item.label}</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 sm:p-8 border border-slate-200 shadow-sm rounded-3xl">
              <h2 className="text-2xl font-semibold text-slate-900">Skills & subjects</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {skillTags.map((subject) => (
                  <Badge key={subject} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 border border-slate-200">
                    {subject}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="p-6 sm:p-8 border border-slate-200 shadow-sm rounded-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">Student reviews</h2>
                <span className="text-sm text-slate-500 font-medium">{tutor.reviews ?? 0} reviews</span>
              </div>
              <div className="mt-5 space-y-4">
                {(tutor.reviews_list || []).slice(0, 3).map((review, index) => (
                  <div key={index} className="space-y-2 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-900">{review.name}</div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(review.rating || 5)].map((_, starIndex) => (
                          <Star key={starIndex} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{review.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 sm:p-8 border border-slate-200 shadow-sm rounded-3xl sticky top-6 bg-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Availability this week</h3>
                  <p className="text-sm text-slate-500">Select a slot to reserve your session.</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Live</span>
              </div>
              <div className="mt-5 grid grid-cols-7 gap-2">
                {dayLetters.map((letter, index) => {
                  const dayName = dayNames[index];
                  const available = availability.includes(dayName);
                  return (
                    <div key={letter} className="text-center">
                      <div className="text-xs text-slate-400 uppercase tracking-[0.18em]">{letter}</div>
                      <div className={`mt-2 flex h-11 items-center justify-center rounded-2xl text-sm font-semibold ${available ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-400"}`}>
                        {available ? "Available" : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setSelectedSlot(slot);
                      setBookingMessage("");
                    }}
                    className={`w-full rounded-3xl border px-4 py-3 text-left text-sm font-semibold transition ${selectedSlot === slot ? "border-sky-500 bg-sky-50 text-sky-900 shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              {bookingMessage ? <p className="mt-3 text-sm text-rose-600">{bookingMessage}</p> : null}

              <Button onClick={handleBookSession} className="mt-5 w-full rounded-full bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-lg shadow-sky-200/50 hover:from-sky-700 hover:to-cyan-700">
                Book a session
              </Button>
            </Card>

            <Card className="p-6 sm:p-8 border border-emerald-200 shadow-sm rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50">
              <h3 className="text-xl font-semibold text-emerald-900">Why book with {tutor.name?.split(" ")[0] || "this tutor"}?</h3>
              <ul className="mt-4 space-y-3 text-sm text-emerald-800">
                {[
                  "Identity & background verified",
                  "Money-back guarantee",
                  "Free 15-min intro call",
                  "Flexible cancellations",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorDetails;
