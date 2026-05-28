import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function Checkout() {
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const details = localStorage.getItem("bookingDetails");
    if (!details) {
      navigate("/tutors");
      return;
    }
    setBookingDetails(JSON.parse(details));
  }, [navigate]);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/bookings/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingDetails),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create order");
      }

      const order = await res.json();

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Trifinity Tutors",
        description: `Session with ${order.tutorName}`,
        order_id: order.orderId,
        handler: async function (response) {
          try {
            const token = localStorage.getItem('token');
            const bookingDetails = JSON.parse(localStorage.getItem('bookingDetails') || '{}');

            const payload = {
              ...bookingDetails,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              paymentSignature: response.razorpay_signature,
            };

            const bookingRes = await fetch('/api/bookings/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });

            if (!bookingRes.ok) {
              const text = await bookingRes.text();
              let errMsg = text;
              try {
                const parsed = JSON.parse(text);
                errMsg = parsed.error || parsed.message || JSON.stringify(parsed);
              } catch (e) {
                // text is not JSON
              }
              throw new Error(errMsg || 'Failed to save booking');
            }

            // parse json safely
            const contentType = bookingRes.headers.get('content-type') || '';
            let bookingJson = null;
            if (contentType.includes('application/json')) {
              bookingJson = await bookingRes.json();
            } else {
              const text = await bookingRes.text();
              try { bookingJson = JSON.parse(text); } catch { bookingJson = null; }
            }

            localStorage.removeItem('bookingDetails');
            // Redirect to student dashboard so the calendar refreshes immediately
            navigate('/dashboard/student');
          } catch (err) {
            console.error('Booking save error:', err);
            alert(err.message || 'Booking succeeded but saving failed. Please contact support.');
            setLoading(false);
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem('user') || '{}').name,
          email: JSON.parse(localStorage.getItem('user') || '{}').email,
        },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();

    } catch (error) {
      console.error("Payment error:", error);
      alert(error.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <p className="text-xl font-semibold text-gray-900">Loading...</p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(bookingDetails.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => {
            localStorage.removeItem("bookingDetails");
            navigate("/tutors");
          }}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tutor
        </button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Payment section */}
          <div className="lg:col-span-2">
            <h1 className="mb-8 text-3xl font-bold text-gray-900">Checkout</h1>

            <Card className="border border-gray-200 p-6 mb-6">
              {/* Razorpay handles Card / UPI / Netbanking inside its own modal */}
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <Lock className="h-8 w-8 text-blue-600" />
                <p className="text-gray-700 font-medium">
                  Pay securely with Card, UPI, or Netbanking
                </p>
                <p className="text-sm text-gray-500">
                  You'll be taken to Razorpay's secure payment screen
                </p>

                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full font-semibold flex items-center justify-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {loading ? "Opening payment..." : `Pay ₹${bookingDetails.total.toFixed(0)}`}
                </Button>

                <p className="text-xs text-gray-500">
                  Secured by Razorpay · 256-bit encryption
                </p>
              </div>
            </Card>
          </div>

          {/* Order Summary — unchanged */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>

              <div className="space-y-4 border-b border-gray-200 pb-4">
                <div>
                  <p className="text-sm text-gray-600">Tutor session</p>
                  <p className="font-semibold text-gray-900">{bookingDetails.duration}h</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">When</p>
                  <p className="font-semibold text-gray-900">
                    {formattedDate} · {bookingDetails.time}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ₹{bookingDetails.subtotal?.toFixed(0) || (bookingDetails.rate * bookingDetails.duration).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform fee</span>
                  <span className="font-semibold text-gray-900">₹{bookingDetails.platformFee}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  ₹{bookingDetails.total.toFixed(0)}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;