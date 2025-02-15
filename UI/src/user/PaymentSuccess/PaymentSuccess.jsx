import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId) {
      axios
        .post("http://localhost:4000/api/event/purchase-success", { sessionId })
        .then((res) => {
          alert("Payment successful! Your order has been placed.");
          const eventId = res.data.eventId;
          navigate(`/events/${eventId}`);
        })
        .catch((err) => {
          console.error("Error confirming payment:", err);
        });
    }
  }, [sessionId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-w p-6">
      <div className="max-w-md w-full bg-purssian-blue shadow-lg rounded-lg p-8 text-center transition-transform transform hover:scale-105">
        <h1 className="text-3xl font-bold text-persian-blue mb-4">Payment Successful! 🎉</h1>
        <p className="text-tomato text-lg mb-6">Your order has been placed successfully.</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 px-6 py-3 bg-tomato text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;