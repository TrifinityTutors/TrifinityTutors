import { useEffect, useMemo, useState } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STATUS_META = {
  booked: { label: "Booked", color: "bg-blue-500" },
  running: { label: "Running", color: "bg-orange-500" },
  completed: { label: "Completed", color: "bg-emerald-500" },
  rescheduled: { label: "Rescheduled", color: "bg-yellow-400" },
  cancelled: { label: "Cancelled", color: "bg-rose-500" },
};

function normalizeDateKey(value) {
  if (!value) return null;
  let parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const normalized = String(value).trim();
    const dmy = normalized.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmy) {
      parsed = new Date(`${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`);
    }
  }
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().split("T")[0];
}

function getStatusKey(rawStatus) {
  const status = String(rawStatus || "").toLowerCase();
  if (status === "running" || status === "in-progress" || status === "in progress") return "running";
  if (status === "completed") return "completed";
  if (status === "rescheduled") return "rescheduled";
  if (status === "cancelled" || status === "canceled") return "cancelled";
  return "booked";
}

function SessionCalendar({ bookings = [], role = "Student" }) {
  const today = new Date();
  const [displayMonth, setDisplayMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(normalizeDateKey(today));
  const [isMobile, setIsMobile] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const normalizedBookings = useMemo(() => {
    return bookings
      .map((booking) => {
        const dateKey = normalizeDateKey(booking.date || booking.timeSlot || booking.createdAt || booking.updatedAt);
        return {
          ...booking,
          dateKey,
          status: getStatusKey(booking.bookingStatus || booking.status),
          time: booking.time || booking.timeSlot || "",
        };
      })
      .filter((booking) => booking.dateKey);
  }, [bookings]);

  const eventsByDate = useMemo(() => {
    return normalizedBookings.reduce((acc, booking) => {
      if (!booking.dateKey) return acc;
      const list = acc[booking.dateKey] || [];
      list.push(booking);
      acc[booking.dateKey] = list;
      return acc;
    }, {});
  }, [normalizedBookings]);

  const dayCount = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate();
  const firstWeekday = displayMonth.getDay();
  const days = Array.from({ length: firstWeekday }, (_, index) => null).concat(
    Array.from({ length: dayCount }, (_, index) => index + 1)
  );

  const selectedEvents = eventsByDate[selectedDate] || [];
  const selectedDateLabel = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Select a date";

  const monthLabel = displayMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 900);
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  const goToPreviousMonth = () => {
    setDisplayMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setDisplayMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const openDate = (dateKey) => {
    setSelectedDate(dateKey);
    if (isMobile) setOpenModal(true);
  };

  const goToToday = () => {
    setDisplayMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    openDate(normalizeDateKey(today));
  };

  const renderEventLabel = (booking) => {
    const status = STATUS_META[booking.status] || STATUS_META.booked;
    const name = role === "Tutor"
      ? booking.studentId?.name || booking.studentName || "Student"
      : booking.tutorName || booking.tutorId?.name || "Tutor";

    return (
      <div key={`${booking._id || booking.dateKey}-${booking.time}-${booking.subject}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{booking.subject || "Session"}</p>
            <p className="mt-1 text-sm text-slate-600 truncate">
              {role === "Tutor" ? "Student" : "Tutor"}: {name}
            </p>
            <p className="mt-1 text-sm text-slate-500">{booking.time || "Time not set"}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${status.color}`}> {status.label} </span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.9fr_1fr]">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{monthLabel}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">Session Calendar</h3>
            <p className="text-sm text-slate-500">Tap any day to review the sessions scheduled for that date.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={goToToday} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              Today
            </button>
            <button type="button" onClick={goToPreviousMonth} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              ←
            </button>
            <button type="button" onClick={goToNextMonth} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`blank-${index}`} className="h-32 rounded-3xl bg-slate-50 sm:h-28" />;
            }

            const dateObj = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
            const dateKey = dateObj.toISOString().split("T")[0];
            const events = eventsByDate[dateKey] || [];
            const isSelected = selectedDate === dateKey;
            const isToday = normalizeDateKey(today) === dateKey;
            const visibleEvents = events.slice(0, 2);
            const extraCount = events.length - 2;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => openDate(dateKey)}
                className={`group relative flex h-32 flex-col rounded-3xl border p-3 text-left transition overflow-hidden ${
                  isSelected ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
                } ${isToday ? "ring-2 ring-blue-200" : ""}`}
              >
                <span className={`text-sm font-semibold ${isSelected ? "text-blue-900" : "text-slate-900"}`}>{day}</span>
                <div className="mt-2 flex h-full flex-col justify-end gap-1 overflow-hidden">
                  {visibleEvents.map((event) => (
                    <span
                      key={`${event._id || event.dateKey}-${event.time}-${event.subject}`}
                      className={`inline-flex max-w-full flex-wrap items-center rounded-full px-2 py-1 text-[10px] font-semibold text-white ${STATUS_META[event.status]?.color || STATUS_META.booked.color}`}
                    >
                      {STATUS_META[event.status]?.label || "Booked"}
                    </span>
                  ))}
                  {extraCount > 0 && (
                    <span className="inline-flex max-w-full rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                      +{extraCount} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <div key={key} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${meta.color}`} />
                <span>{meta.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden md:block rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-[0.18em]">Selected</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">{selectedDateLabel}</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{selectedEvents.length} session{selectedEvents.length === 1 ? "" : "s"}</span>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {selectedEvents.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              No sessions scheduled for this date.
            </div>
          ) : (
            selectedEvents.sort((a, b) => (a.time || "").localeCompare(b.time || "")).map(renderEventLabel)
          )}
        </div>
      </div>

      {openModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm md:hidden">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-[0.18em]">Selected</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{selectedDateLabel}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {selectedEvents.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  No sessions scheduled for this date.
                </div>
              ) : (
                selectedEvents.sort((a, b) => (a.time || "").localeCompare(b.time || "")).map(renderEventLabel)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionCalendar;
