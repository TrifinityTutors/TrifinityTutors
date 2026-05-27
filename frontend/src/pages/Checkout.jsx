import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function Checkout() {
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
  });

  useEffect(() => {
    const details = localStorage.getItem("bookingDetails");
    if (!details) {
      navigate("/tutors");
      return;
    }
    setBookingDetails(JSON.parse(details));
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("Payment successful! Your session has been booked.");
      localStorage.removeItem("bookingDetails");
      navigate("/student-dashboard");
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
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
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <h1 className="mb-8 text-3xl font-bold text-gray-900">Checkout</h1>

            <Card className="border border-gray-200 p-6 mb-6">
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`px-4 py-2 rounded-lg border transition ${
                    paymentMethod === "card"
                      ? "border-blue-600 bg-blue-50 text-blue-600 font-medium"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Card
                </button>
                <button
                  onClick={() => setPaymentMethod("upi")}
                  className={`px-4 py-2 rounded-lg border transition ${
                    paymentMethod === "upi"
                      ? "border-blue-600 bg-blue-50 text-blue-600 font-medium"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  UPI
                </button>
                <button
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`px-4 py-2 rounded-lg border transition ${
                    paymentMethod === "netbanking"
                      ? "border-blue-600 bg-blue-50 text-blue-600 font-medium"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Netbanking
                </button>
              </div>

              {paymentMethod === "card" && (
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Card number</label>
                    <Input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="4242 4242 4242 4242"
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Name on card</label>
                    <Input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Expiry</label>
                      <Input
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">CVC</label>
                      <Input
                        type="text"
                        name="cvc"
                        value={formData.cvc}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full font-semibold flex items-center justify-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    {loading ? "Processing..." : `Pay ₹${bookingDetails.total.toFixed(0)}`}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    Secured by 256-bit encryption · This is a demo
                  </p>
                </form>
              )}

              {paymentMethod === "upi" && (
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">UPI ID</label>
                    <Input
                      type="text"
                      placeholder="yourname@upi"
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full font-semibold"
                  >
                    {loading ? "Processing..." : `Pay ₹${bookingDetails.total.toFixed(0)}`}
                  </Button>
                </form>
              )}

              {paymentMethod === "netbanking" && (
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Select Bank</label>
                    <select className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900">
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>SBI Bank</option>
                      <option>Axis Bank</option>
                    </select>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full font-semibold"
                  >
                    {loading ? "Processing..." : `Pay ₹${bookingDetails.total.toFixed(0)}`}
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* Order Summary */}
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
                  <p className="font-semibold text-gray-900">{formattedDate} · {bookingDetails.time}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{bookingDetails.subtotal?.toFixed(0) || (bookingDetails.rate * bookingDetails.duration).toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform fee</span>
                  <span className="font-semibold text-gray-900">₹{bookingDetails.platformFee}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">₹{bookingDetails.total.toFixed(0)}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
