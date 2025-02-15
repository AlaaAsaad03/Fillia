import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); 
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;

  const [confirmed, setConfirmed] = useState(false);

useEffect(() => {
  const confirmDonation = async () => {
    const caseId = searchParams.get("caseId");
    const amount = searchParams.get("amount");
    const userIdFromParams = searchParams.get("userId");
    const eventId = searchParams.get("eventId");

    if (!caseId || !amount || !userIdFromParams || !eventId) {
      console.error("Missing donation details");
      return;
    }

    try {
      await axios.get("http://localhost:4000/api/event/donation-success", {
        params: { caseId, amount, userId: userIdFromParams, eventId },
        headers: { Authorization: `Bearer ${token}` },
      });

      setConfirmed(true);
    } catch (error) {
      console.error("Error confirming donation:", error);
    }
  };

  confirmDonation();
}, [searchParams, navigate, token]);

return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-blue p-6">
    <div className="max-w-md w-full bg-purssian-blue shadow-lg rounded-lg p-8 text-center">
      <h1 className="text-3xl font-bold text-persian-blue mb-4">Donation Successful! 🎉</h1>
      <p className="text-tomato text-lg mb-6">Thank you for your generous donation.</p>
      {confirmed && (
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 px-6 py-3 bg-tomato text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300"
        >
          Go to Home
          </button>
      )}
    </div>
  </div>
);

};

export default DonationSuccess;