import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CreatedCases.css"; // Import CSS for styling
import { FaCheckCircle, FaPlusCircle, FaBox, FaTruck } from "react-icons/fa";
import { LuLoader } from "react-icons/lu";
import CreateCaseForm from "../CreateCaseForm/CreateCaseForm"; // Adjusted import path
import GeneralLoader from "../../components/GeneralLoader/GeneralLoader";

const CreatedCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  

  const filteredCases = cases.filter(caseItem =>
    caseItem.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const token = localStorage.getItem("token");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;

  // useEffect(() => {
  //   const fetchCreatedCases = async () => {
  //     try {
  //       const response = await axios.get(
  //         `http://localhost:4000/api/cases/created/${userId}`,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       if (response.data.cases && response.data.cases.length > 0) {
  //         setCases(response.data.cases);
  //       } else {
  //         console.warn("No cases found.");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching created cases:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCreatedCases();
  // }, [userId, token]);

  const fetchCreatedCases = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/cases/created/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.cases && response.data.cases.length > 0) {
        setCases(response.data.cases);
      } else {
        console.warn("No cases found.");
      }
    } catch (error) {
      console.error("Error fetching created cases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatedCases();
    const interval = setInterval(fetchCreatedCases, 60000); // Fetch every 5 seconds
    return () => clearInterval(interval); // Cleanup when the component unmounts
  }, [userId, token]);
  
  
  const toggleForm = () => {
    setShowForm(!showForm);
  };

  if (loading) {
    return <GeneralLoader message="Fetching your cases... Together, we're creating change." />;
  }

  const handleConfirmDelivery = async (caseId) => {
    try {
      await axios.put(
        `http://localhost:4000/api/cases/${caseId}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Refetch the cases to get the latest data
      const response = await axios.get(
        `http://localhost:4000/api/cases/created/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setCases(response.data.cases);
    } catch (error) {
      console.error("Error confirming delivery:", error);
    }
  };
  


  return (
    <div className="created-cases-page">

      <div className="searchh-barr">
      <i className="search-iconn fas fa-search"></i>

              <input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

      <div className="items-table-containerr">
        <table className="items-table">
          <thead>
            <tr>
              <th className="title-case-title">Title</th>
              <th>Date Created</th>
              <th>Deadline</th>
              <th>Items Needed</th>
              <th>Status</th>
              <th>Verification</th>
            </tr>
          </thead>
          <tbody>
    {cases.map((caseItem) => {
        // Log the level of each case
        console.log(caseItem.level); // Check the actual level value

        return (
            <tr key={caseItem._id}>
                <td className="title-case-title">{caseItem.title}</td>
                <td>{new Date(caseItem.dateCreated).toLocaleDateString()}</td>
                <td>{new Date(caseItem.deadline).toLocaleDateString()}</td>
                <td>
                    <div className="items-summary">
                        <span>
                            {caseItem.itemsNeeded.length} item{caseItem.itemsNeeded.length !== 1 ? 's' : ''}
                        </span>
                        <div className="items-tooltip">
                            {caseItem.itemsNeeded.map((item) => (
                                <span key={item.id || item._id}>{item.name}</span>
                            ))}
                        </div>
                    </div>
                </td>
                <td>
    <span className={`status-button status-${caseItem.level.replace(/ /g, "-").toLowerCase()}`}>
      {caseItem.level.charAt(0).toUpperCase() + caseItem.level.slice(1)}
    </span>
  </td>
                <td>
                    {caseItem.level.toLowerCase() === "delivered" &&
                    caseItem.userVerification !== "Delivered" ? (
                        <button
                            className="confirm-button"
                            onClick={() => handleConfirmDelivery(caseItem._id)}
                        >
                            Confirm
                        </button>
                    ) : caseItem.userVerification === "Delivered" ? (
                        <button className="check-button">
                            <FaCheckCircle />
                        </button>
                    ) : (
                        "Pending"
                    )}
                </td>
            </tr>
        );
    })}
</tbody>
        </table>
      </div>
      <div className="button-containerr">
        <button className="add-case-button" onClick={toggleForm}>
           Add Case
        </button>
      </div>
      {showForm && (
        <div className="form-modal">
          <div className="form-modal-overlay" onClick={toggleForm} />
          <div className="form-modal-contentt">
            <CreateCaseForm onClose={toggleForm} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatedCases;