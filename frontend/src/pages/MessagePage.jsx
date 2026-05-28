import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock, Search, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTutorById } from "@/data/tutors";

const quickQuestions = [
  "Do you teach JEE Advanced?",
  "Are online sessions available?",
  "Do you provide notes?",
  "What is your teaching language?",
  "What are your available timings?",
];

const quickReplies = {
  "Do you teach JEE Advanced?": "Yes, I teach JEE Advanced and can tailor sessions to the latest syllabus.",
  "Are online sessions available?": "Absolutely, I offer flexible online sessions that fit your schedule.",
  "Do you provide notes?": "Yes, I share structured notes and problem-solving guides after each session.",
  "What is your teaching language?": "I teach in English and Hindi, and can adapt to what works best for you.",
  "What are your available timings?": "I have weekday evenings and weekend mornings available for new students.",
};

const hasBookedSession = false; // Mock state until backend booking is available

const formatTime = () => {
  const now = new Date();
  return `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`;
};

function MessagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loadingTutor, setLoadingTutor] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "tutor",
      text: "Hey! Ready for today's session?",
      time: "5:01 PM",
    },
    {
      id: 2,
      sender: "student",
      text: "Yes! Should I go through chapter 4 first?",
      time: "5:02 PM",
    },
    {
      id: 3,
      sender: "tutor",
      text: "Yes please, and bring your last test paper.",
      time: "5:03 PM",
    },
  ]);
  const [draftMessage, setDraftMessage] = useState("");
  const [quickUsed, setQuickUsed] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    const loadTutor = async () => {
      setLoadingTutor(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/tutors/profile/${id}`);
        if (response?.data) {
          setTutor(response.data);
        } else {
          setTutor(getTutorById(id));
        }
      } catch (error) {
        setTutor(getTutorById(id));
      } finally {
        setLoadingTutor(false);
      }
    };

    loadTutor();
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loadingTutor) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-20 text-slate-700">
          Loading tutor chat…
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <p className="text-xl font-semibold text-slate-900">Tutor not found</p>
          <p className="mt-3 text-slate-600">We couldn't find the tutor you're trying to message.</p>
          <Button onClick={() => navigate("/tutors")} className="mt-6 bg-sky-600 text-white hover:bg-sky-700">
            Back to tutors
          </Button>
        </div>
      </div>
    );
  }

  const canUseQuickReply = !hasBookedSession && quickUsed < 3;
  const quickRemaining = 3 - quickUsed;
  const isLocked = !hasBookedSession && quickUsed >= 3;
  const displaySubject = tutor?.subject || (Array.isArray(tutor?.subjects) ? tutor.subjects[0] : tutor?.specialty) || "Tutoring";
  const displayLocation = tutor?.location || tutor?.locality || tutor?.city || "Remote";
  const displayRating = tutor?.rating || tutor?.avgRating || 4.8;
  const displayReviews = tutor?.reviews || tutor?.reviewCount || 0;

  const handleQuickReply = (question) => {
    if (!canUseQuickReply) return;
    const nextMessage = {
      id: messages.length + 1,
      sender: "student",
      text: question,
      time: formatTime(),
    };
    setMessages((prev) => [...prev, nextMessage]);
    setQuickUsed((prev) => prev + 1);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "tutor",
          text: quickReplies[question] || "I can help with that. Book a session to continue chatting.",
          time: formatTime(),
        },
      ]);
    }, 650);
  };

  const handleSend = () => {
    if (!draftMessage.trim()) return;
    const text = draftMessage.trim();
    const nextMessage = {
      id: messages.length + 1,
      sender: "student",
      text,
      time: formatTime(),
    };
    setMessages((prev) => [...prev, nextMessage]);
    setDraftMessage("");
    setIsSending(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "tutor",
          text: "Thanks for the message — I'll review it and send you a tailored plan shortly.",
          time: formatTime(),
        },
      ]);
      setIsSending(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Active conversation</p>
                <p className="mt-1 text-xs text-slate-400">Your current tutor chat</p>
              </div>
              <MessageCircle className="h-5 w-5 text-sky-500" />
            </div>

            <div className="mt-6 rounded-3xl bg-slate-50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-3xl bg-gradient-to-br ${tutor.grad || "from-sky-500 to-cyan-500"} text-white text-lg font-semibold`}>
                  {tutor.name.split(" ").map((part) => part[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold text-slate-900">{tutor.name}</p>
                  <p className="mt-1 truncate text-sm text-slate-500">{displaySubject} · {displayLocation}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">{displayRating.toFixed(1)} ★</span>
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">{displayReviews} reviews</span>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-slate-600">
                <Search className="h-4 w-4" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  placeholder="Search conversation"
                  aria-label="Search conversation"
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Conversation preview</p>
                <p className="mt-2 text-sm text-slate-500">Most recent message from {tutor.name.split(" ")[0]}.</p>
                <p className="mt-3 text-sm text-slate-600">“{messages[messages.length - 1]?.text || "Start the conversation with a quick question."}”</p>
              </div>
            </div>
          </aside>

          <main className="grid gap-4">
            <Card className="overflow-hidden border border-slate-200">
              <div className="flex flex-col gap-4 bg-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white text-lg font-semibold">
                    {tutor.name.split(" ").map((part) => part[0]).join("")}
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-slate-900">{tutor.name}</h1>
                    <p className="mt-1 text-sm text-slate-600">{tutor.subject} · {tutor.location || "Remote"}</p>
                  </div>
                </div>
                <Link to={`/tutors/${id}`} className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:self-center">
                  <ArrowLeft className="h-4 w-4" /> Back to profile
                </Link>
              </div>

              <div className="px-6 py-5 sm:px-8">
                <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600 shadow-inner">
                  <div className="flex flex-col gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-900">Pre-booking chat access</span>
                    </div>
                    <p>
                      Students can use quick replies only. Book a session to unlock full chat and contact details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-h-[560px] overflow-hidden border-t border-slate-200 bg-slate-50 px-4 py-5 sm:px-8">
                <div className="flex h-full flex-col gap-5">
                  <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3">
                    <div>
                      <p className="text-sm text-slate-500">Chat with {tutor.name.split(" ")[0]}</p>
                      <p className="mt-1 text-xs text-slate-400">{hasBookedSession ? "Full chat unlocked" : `Quick replies left: ${quickRemaining}`}</p>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-xs font-semibold ${hasBookedSession ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {hasBookedSession ? "Unlimited chat" : "Limited access"}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 pb-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className={`${message.sender === "student" ? "justify-end" : "justify-start"} flex`}>
                          <div className={`${message.sender === "student" ? "rounded-[24px] rounded-br-[4px] bg-sky-600 text-white shadow-lg" : "rounded-[24px] rounded-bl-[4px] bg-white text-slate-900 border border-slate-200"} max-w-[80%] px-4 py-3 shadow-sm`}> 
                            <p className="text-sm leading-6">{message.text}</p>
                            <div className="mt-2 text-right text-[11px] text-slate-400">{message.time}</div>
                          </div>
                        </div>
                      ))}
                      <div ref={endRef} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {!hasBookedSession && (
                      <div className="rounded-3xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Quick questions</p>
                            <p className="text-xs text-slate-500">Use up to 3 quick replies before booking.</p>
                          </div>
                          <span className="text-xs text-slate-500">{quickRemaining} left</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {quickQuestions.map((question) => (
                            <button
                              key={question}
                              type="button"
                              onClick={() => handleQuickReply(question)}
                              disabled={!canUseQuickReply}
                              className={`rounded-full border px-4 py-2 text-sm transition ${canUseQuickReply ? "border-slate-300 bg-slate-100 text-slate-700 hover:border-slate-400 hover:bg-slate-200" : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"}`}
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {isLocked && (
                      <div className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-rose-200">
                        <p className="font-semibold">Book a session to continue chatting with this tutor.</p>
                        <p className="mt-2 text-sm text-rose-600">You have reached the free quick-reply limit.</p>
                        <Button onClick={() => navigate(`/booking/${id}`)} className="mt-4 bg-rose-600 text-white hover:bg-rose-700">
                          Book session now
                        </Button>
                      </div>
                    )}

                    <div className="rounded-3xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <input
                          className="min-h-[48px] flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                          placeholder={hasBookedSession ? "Type a message..." : "Book a session to unlock full chat"}
                          disabled={!hasBookedSession}
                          value={draftMessage}
                          onChange={(event) => setDraftMessage(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && hasBookedSession) {
                              event.preventDefault();
                              handleSend();
                            }
                          }}
                        />
                        <Button
                          onClick={handleSend}
                          disabled={!hasBookedSession || !draftMessage.trim() || isSending}
                          className="inline-flex h-12 w-full justify-center rounded-full bg-sky-600 px-4 text-white hover:bg-sky-700 disabled:bg-slate-300 sm:w-12 sm:px-0"
                          aria-label="Send message"
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                      {!hasBookedSession && (
                        <p className="mt-3 text-xs text-slate-500">
                          Free typing is disabled before booking. Quick replies are available for simple pre-booking questions.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}

export default MessagePage;
