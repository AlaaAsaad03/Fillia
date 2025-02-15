import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./MyCases.css";
import { StoreContext } from "../context/StoreContext";
import { FaCheckCircle } from "react-icons/fa";
import GeneralLoader from "../../components/GeneralLoader/GeneralLoader";

const MyCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { url } = useContext(StoreContext);

  const token = localStorage.getItem("token");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;
  const [clickedCard, setClickedCard] = useState(null);

  const fetchCases = async () => {
    try {
      const response = await axios.get(`${url}/api/cases/${userId}/getusercase`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCases(response.data.cases);
    } catch (err) {
      setError("Error fetching cases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [cases]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCases();
    }, 60000); // Fetch every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleCardClick = (caseId) => {
    setClickedCard(caseId);
  };

  if (loading) {
    return <GeneralLoader message="Fetching your donation history..." />;
  }

  if (error) return <div className="error">{error}</div>;

  const generateRandomRotation = () => (Math.random() * 2 - 1).toFixed(2); // Generates a value between -1 and 1

  return (
    <div className="my-cases-container">
      <div className="cases-list">
        {cases.map((caseItem) => (
          <div
            className="mycase-card"
            key={caseItem._id}
            onClick={() => handleCardClick(caseItem._id)}
            style={{
              "--random-rotation": generateRandomRotation(), // Apply random rotation here
              opacity: clickedCard === caseItem._id ? 0.5 : 1,
              pointerEvents: clickedCard === caseItem._id ? "none" : "auto",
            }}
          >
            <img src="/pin.png" alt="Pin Icon" className="cases-pin-icon" />
            <div className="case-header">
              <div className="mycase-date">
                {new Date(caseItem.dateCreated).toLocaleDateString()}
              </div>
              <div className="case-titlee">
                {caseItem.title}
                {caseItem.status === "done" && (
                  <FaCheckCircle className="done-icon animated-icon" aria-label="Done" />
                )}
              </div>
            </div>
            <div className="case-items-container">
              <ul className="case-itemss">
                {caseItem.itemsNeeded.map((item, index) => (
                  <li key={index} className="case-itemm">
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCases;
