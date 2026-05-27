import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const timeSlots = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "18:30", "20:00"];

function BookingSession() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedMode, setSelectedMode] = useState("online");
  const [duration, setDuration] = useState(1.5);

  // Generate next 7 days
  const [dateOptions, setDateOptions] = useState([]);

  useEffect(() => {
    const today = new Date();
    const dates = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push({
        day: dayNames[date.getDay()],
        date: date.getDate(),
        fullDate: date,
      });
    }
    setDateOptions(dates);
    if (dates.length > 0) {
      setSelectedDay(dates[0]);
    }
  }, []);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/tutors/profile/${id}`);
        setTutor(response.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Tutor profile not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-20 text-gray-700">
          Loading tutor details…
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <p className="text-xl font-semibold text-gray-900">Tutor not found</p>
          <Button
            onClick={() => navigate("/tutors")}
            className="mt-6 bg-blue-600 hover:bg-blue-700"
          >
            Back to Tutors
          </Button>
        </div>
      </div>
    );
  }

  const hourlyRate = tutor?.hourlyRate || tutor?.price || 0;
  const platformFee = 96;
  const subtotal = hourlyRate * duration;
  const total = subtotal + platformFee;

  const handleContinueToPayment = () => {
    if (!selectedDay || !selectedTime) {
      alert("Please select a date and time");
      return;
    }

    const bookingDetails = {
      tutorId: tutor._id || id,
      tutorName: tutor.name,
      subject: tutor.subject || tutor.subjects?.[0] || "Tutoring",
      date: selectedDay.fullDate.toISOString().split("T")[0],
      time: selectedTime,
      mode: selectedMode,
      duration,
      rate: hourlyRate,
      subtotal,
      platformFee,
      total,
    };

    localStorage.setItem("bookingDetails", JSON.stringify(bookingDetails));
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/tutors/${id}`)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tutor
        </button>

        <h1 className="mb-8 text-4xl font-bold text-gray-900">Book a session</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tutor Info Card */}
            <Card className="border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className={`relative h-16 w-16 rounded-full grid place-items-center text-white font-bold text-xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-sm`}>
                  {tutor.name?.split(" ").map((word) => word[0]).join("")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">{tutor.name}</h2>
                    <span className="inline-block text-sm text-gray-600">
                      · {tutor.subject || tutor.subjects?.[0] || "Tutoring"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{tutor.rating?.toFixed(2) || "4.9"}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {tutor.locality || "Remote"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Choose a Day */}
            <Card className="border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose a day</h3>
              <div className="grid grid-cols-7 gap-2">
                {dateOptions.map((d, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(d)}
                    className={`flex flex-col items-center py-3 px-2 rounded-lg border-2 transition ${
                      selectedDay?.date === d.date
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <span className="text-xs text-gray-600">{d.day}</span>
                    <span className="text-lg font-bold text-gray-900">{d.date}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Choose a Time */}
            <Card className="border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose a time</h3>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-3 rounded-lg border transition text-sm font-medium ${
                      selectedTime === time
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </Card>

            {/* Mode Selection */}
            <Card className="border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mode</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setSelectedMode("online")}
                  className={`p-4 rounded-xl border-2 transition text-left ${
                    selectedMode === "online"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900">Online (Video Call)</p>
                  <p className="text-sm text-gray-600">Meet via Secure Video Link</p>
                </button>
                <button
                  onClick={() => setSelectedMode("home")}
                  className={`p-4 rounded-xl border-2 transition text-left ${
                    selectedMode === "home"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900">Home Visit</p>
                  <p className="text-sm text-gray-600">Tutor Comes To Your Address</p>
                </button>
              </div>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order summary</h3>
              
              <div className="space-y-3 border-b border-gray-200 pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rate</span>
                  <span className="font-semibold text-gray-900">₹{hourlyRate}/hr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseFloat(e.target.value))}
                    className="font-semibold text-gray-900 bg-transparent border-0 p-0 focus:ring-0"
                  >
                    <option value={0.5}>30 min</option>
                    <option value={1}>1 hour</option>
                    <option value={1.5}>1.5 hours</option>
                    <option value={2}>2 hours</option>
                  </select>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform fee</span>
                  <span className="font-semibold text-gray-900">₹{platformFee}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center mb-6">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">₹{total.toFixed(0)}</span>
              </div>

              <Button
                onClick={handleContinueToPayment}
                disabled={!selectedDay || !selectedTime}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to payment
              </Button>

              <p className="mt-3 text-xs text-gray-500 text-center">Free to cancel up to 12h before</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingSession;
