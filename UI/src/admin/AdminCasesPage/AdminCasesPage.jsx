
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminCasesPage.css";
import { saveAs } from 'file-saver';
import styled from "styled-components";
import GeneralLoader from "../../components/GeneralLoader/GeneralLoader";


const AdminCasesPage = ({ role }) => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [popupContent, setPopupContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [packedCases, setPackedCases] = useState([]);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showCaseTypeModal, setShowCaseTypeModal] = useState(false);
  const [aiStatus, setAiStatus] = useState(false); // Track AI enable/disable state
  const newStatus = aiStatus ? "disable" : "enable";
  const [loadingMessage, setLoadingMessage] = useState("");

  const url = "http://localhost:4000";

  let adminRole = "";
  const token = localStorage.getItem("token");

if (token){
  const payload = JSON.parse(atob(token.split(".")[1])); // Decodes the payload part of the JWT
  const adminId = payload.id;
   adminRole = payload.role;
  console.log("adminId", adminId)
  console.log("adminRole", adminRole)
}
    const loadPackedCases = () => {
      try {
        const packed = JSON.parse(localStorage.getItem("packedCases")) || [];
        setPackedCases(packed);
      } catch (error) {
        console.error("Failed to load packed cases:", error);
        setPackedCases([]);
      }
    };
    const downloadImage = () => {
      saveAs(`${url}/images/${popupContent.salaryImage}`, 'salary-document.jpg') // Put your image URL here.
    }

    const downloadCaseTypeImage = () => {
      saveAs(`${url}/images/${popupContent.caseTypeImage}`, 'case-type-document.jpg');
    };

    // Fetch cases for the admin
    const fetchCases = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:4000/api/cases/get");
        setCases(response.data.cases);
      } catch (error) {
        console.error("Error fetching cases:", error);
      }finally {
        setLoading(false); 
      }
    };

    // Fetch helper name
    const fetchHelperName = async (helperId) => {
      if (!helperId) {
        console.error("Helper ID is null or undefined");
        return "Unknown";
      }
      try {
        const response = await axios.get(`http://localhost:4000/api/profile/${helperId}/getprofile`);
        if (response.data.success) {
          return response.data.user.name;
        } else {
          console.error("Error fetching helper name:", response.data.message);
          return "Unknown";
        }
      } catch (error) {
        console.error("Error fetching helper name:", error);
        return "Unknown";
      }
    };

    // Handle Accept/Reject action
    const handleCaseAction = async (action) => {
      if (!selectedCase) return;

      try {
        if (action === "accepted" || action === "rejected") {
          // Update the case's acceptance status to accepted
          await axios.patch(
            `http://localhost:4000/api/cases/${selectedCase._id}/status`,
            { acceptanceStatus: action }
          );

          // Refresh the popup content with additional details
          const acceptedCase = cases.find((c) => c._id === selectedCase._id);
          const helperName = await fetchHelperName(acceptedCase.helperId);
          setPopupContent({
            ...acceptedCase,
            helperName: helperName || "Not taken",
          });
        } 

          // Close the popup and refresh the cases list
          setPopupContent(null);
          setSelectedCase(null);
          fetchCases(); // Refresh the cases list
        } catch (error) {
          console.error(`Error updating case status: ${error}`);
        }
      };

    // Handle checkbox change to update the level
    // const handleCheckboxChange = async (caseId) => {
    //   setLoading(true);
    //   try {
    //     const updatedCases = cases.map((c) =>
    //       c._id === caseId ? { ...c, level: "packing" } : c
    //     );
    //     setCases(updatedCases); // Update UI optimistically
    
    //     await axios.patch(
    //       `http://localhost:4000/api/cases/${caseId}/update-level`,
    //       { level: "packing" },
    //       {
    //         headers: { Authorization: `Bearer ${token}` },
    //       }
    //     );
    //     if (!packedCases.includes(caseId)) {
    //       const updatedPackedCases = [...packedCases, caseId];
    //       setPackedCases(updatedPackedCases);
    //       localStorage.setItem("packedCases", JSON.stringify(updatedPackedCases));
    //     } 
    //     fetchCases();  // Refresh the list after the change
    //   } catch (error) {
    //     console.error("Error updating case level:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };


    const handleCheckboxChange = async (caseId) => {
      setLoading(true);
      try {
        const caseToUpdate = cases.find(c => c._id === caseId);
        
        // Only change the level if the current level is "processing"
        if (caseToUpdate && caseToUpdate.level === "processing") {
          const updatedCases = cases.map((c) => {
            if (c._id === caseId) {
              return { ...c, level: "packing" }; // Change to packing
            }
            return c; // Return unchanged case
          });
    
          setCases(updatedCases); // Optimistically update the UI
    
          await axios.patch(
            `http://localhost:4000/api/cases/${caseId}/update-level`,
            { level: "packing" }, // Update only to "packing"
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
    
          fetchCases(); // Refresh the case list after the change
        }
      } catch (error) {
        console.error("Error updating case level:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const handleSort = (order) => {
      setSortOrder(order);
      const sortedCases = [...cases].sort((a, b) => {
          const dateA = new Date(a.dateCreated);
          const dateB = new Date(b.dateCreated);
          return order === 'newest' ? dateB - dateA : dateA - dateB;
      });
      setCases(sortedCases); // Ensure this line is present
      console.log('Sorted cases:', sortedCases);
  };

  const toggleAiStatus = async () => {
    const newStatus = aiStatus ? "disable" : "enable";
    setLoading(true);
    setLoadingMessage("Switching AI mode, just a moment...");
    try {
      const response = await axios.post(
        "http://localhost:4000/api/admin/ai-status",
        { aiStatus: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(`AI status updated to ${newStatus}:`, response.data);
      setAiStatus(!aiStatus);


      // Call the update-case-status endpoint after toggling AI status
      await axios.post(
        'http://localhost:4000/api/cases/update-case-status',
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error toggling AI status:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusImages = {
    waiting: "boxx.png",
    packing: "seal.png",
    "out for delivery": "fast-shipping.png",
    delivered: "complete.png",
  };
  

  const filteredCases = cases
  .filter((caseItem) =>
    caseItem.title && caseItem.title.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .sort((a, b) => {
    // Prioritize cases with `loading` and `waiting` statuses
    const priorityOrder = { loading: 1, waiting: 2, accepted: 3, done: 4, rejected: 5 };
    const statusA = priorityOrder[a.acceptanceStatus] || 6; // Default priority for unknown status
    const statusB = priorityOrder[b.acceptanceStatus] || 6;
    return statusA - statusB;
  });

  // Close the popup and refresh the cases list
  const closePopup = () => {
    setPopupContent(null);
    setSelectedCase(null);
    fetchCases();
  };

  useEffect(() => {
     
    loadPackedCases(); // Load packed cases on mount
    // const fetchAiStatus = async () => {
    //   try {
    //     const response = await axios.post("http://localhost:4000/api/admin/ai-status", 
    //      { aiStatus: newStatus },
    //      {
    //       headers: {
    //         'Content-Type': 'application/json',
    //         Authorization: `Bearer ${token}`, // Include the token
    //       },
    //     });
    //     console.log(`AI status updated to ${newStatus}:`, response.data);
    //     setAiStatus(!aiStatus);
    
    //     // Call the update-case-status endpoint after toggling AI status
    //     await axios.post(
    //       'http://localhost:4000/api/cases/update-case-status',
    //       {},
    //       {
    //         headers: {
    //           'Content-Type': 'application/json',
    //           Authorization: `Bearer ${token}`, // Include the token for authorization
    //         },
    //       }
    //     );  
    //   } catch (error) {
    //     console.error("Error fetching AI status:", error);
    //   }
    // };
    
    // fetchAiStatus();
    fetchCases();
  }, []);

  const AIToggle = ({ aiStatus, loading, onToggle }) => {
    return (
      <StyledWrapper>
        <span className="label">
          {aiStatus ? "AI Enabled" : "AI Disabled"}
        </span>
        <label className="switch">
          <input
            type="checkbox"
            checked={aiStatus}
            onChange={onToggle}
            disabled={loading}
          />
          <span className="slider"></span>
        </label>
      </StyledWrapper>
    );
  };

  const StyledWrapper = styled.div`
  display: flex;
  align-items: center; /* Align items vertically centered */
  margin: 20px;

  .switch {
    position: relative;
    display: inline-block;
    width: 100px; /* Adjusted width */
    height: 40px;
    margin-left: 10px; /* Space between label and toggle */
  }

  .switch input {
    display: none;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    border-radius: 40px;
    transition: background-color 0.4s;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .slider:before {
    content: "";
    position: absolute;
    height: 30px;
    width: 30px;
    background-color: white;
    border-radius: 50%;
    bottom: 5px;
    left: 5px;
    transition: transform 0.4s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  input:checked + .slider {
    background-color: limegreen;
  }

  input:checked + .slider:before {
    transform: translateX(60px);
  }

  .label {
    color: black; /* Ensure visibility */
    font-size: 14px; /* Adjust font size */
    text-transform: uppercase;
    font-weight: bold;
  }
`;

  const isAuthorized = adminRole === "Leader";

  return (
    <div className={`main-contentt ${!isAuthorized ? "blurred" : ""}`}>
      
      {!isAuthorized && (
        <div className="lock-overlay">
          <i className="lock-icon">🔒</i>
          <p>Access Restricted</p>
        </div>
      )}
    {loading && isAuthorized ? (
            <GeneralLoader message="Fetching Donations, hold on tight..." /> // Show loader while fetching
          ) : (
      isAuthorized && (
        <>
        


<div className="search-and-filter">
            <div className="searchh-barr">
              <i className="search-iconn fas fa-search"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="By User or Content..."
                />
              </div>
              <div className="filter-buttonss">
                <button onClick={() => handleSort('newest')} className="filter-buttonn">Newest</button>
                <button onClick={() => handleSort('oldest')} className="filter-buttonn">Oldest</button>
              </div>
            </div>

            <div className="ai-toggle-container">
            <div className="ai-toggle">
            <AIToggle
            aiStatus={aiStatus}
            loading={loading}
            onToggle={toggleAiStatus}
          />
          </div>
            <div className="ai-status-container">
                <div className="ai-status-indicator">
                  <span className="status-dot"></span>
                  <span className="ai-label">By AI</span>
                </div>
              </div>
            </div>
            <div className="cards-container">
              
        {filteredCases.map((c) => (
          <div
            key={c._id}
            className={`case-card ${
              c.acceptanceStatus === "loading"  
                ? "loading" 
                : c.acceptanceStatus === "accepted"
                ? "accepted"
                : c.status === "done"
                ? "done"
                : ""
            }`}
      onClick={() => {
        setSelectedCase(c);
        if (c.helperId) {
            fetchHelperName(c.helperId).then((helperName) => {
                setPopupContent({
                    ...c,
                    helperName: helperName,
                });
            });
        } else {
            setPopupContent({
                ...c,
                helperName: "Unknown",
            });
        }
    }}
    >
      <section className="relative group flex flex-col items-center justify-center w-full h-full overflow-visible">
        <div className="file relative w-60 h-40 cursor-pointer">
        <section
          class="relative group flex flex-col items-center justify-center w-full h-full"
        >
          <div
            class="file relative w-60 h-40 cursor-pointer origin-bottom [perspective:1500px] z-50"
          >
            <div
              class="work-5 bg-amber-600 w-full h-full origin-top rounded-2xl rounded-tl-none group-hover:shadow-[0_20px_40px_rgba(0,0,0,.2)] transition-all ease duration-300 relative after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-20 after:h-4 after:bg-amber-600 after:rounded-t-2xl before:absolute before:content-[''] before:-top-[15px] before:left-[75.5px] before:w-4 before:h-4 before:bg-amber-600 before:[clip-path:polygon(0_35%,0%_100%,50%_100%);]"
            ></div>
            <div
              class="work-4 absolute inset-1 bg-zinc-400 rounded-2xl transition-all ease duration-300 origin-bottom select-none group-hover:[transform:rotateX(-20deg)]"
            ></div>
            <div
              class="work-3 absolute inset-1 bg-zinc-300 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-30deg)]"
            ></div>
            <div
              class="work-2 absolute inset-1 bg-zinc-200 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-38deg)]"
            ></div>
            <div
              class="work-1 absolute bottom-0 bg-gradient-to-t from-amber-500 to-amber-400 w-full h-[156px] rounded-2xl rounded-tr-none after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-[146px] after:h-[16px] after:bg-amber-400 after:rounded-t-2xl before:absolute before:content-[''] before:-top-[10px] before:right-[142px] before:size-3 before:bg-amber-400 before:[clip-path:polygon(100%_14%,50%_100%,100%_100%);] transition-all ease duration-300 origin-bottom flex items-end group-hover:shadow-[inset_0_20px_40px_#fbbf24,_inset_0_-20px_40px_#d97706] group-hover:[transform:rotateX(-46deg)_translateY(1px)]"
            ></div>
          </div>
        </section>
        </div>

        {/* Title Overlay */}
        <h3 className="case-title">{c.title}</h3>
        
        {/* Stamp Overlay
        {c.acceptanceStatus === "accepted" && (
          <div className="stamp accepted-stamp">
            <img src="/accepted.png" alt="Accepted" />
          </div>
        )}
        {c.acceptanceStatus === "rejected" && (
          <div className="stamp rejected-stamp">
            <img src="/rejected.png" alt="Rejected" />
          </div>
        )} */}

         {/* Image Logic Based on AI Label and Acceptance Status */}
         {c.acceptanceStatus === "accepted" && (
          <>
            {c.AiLabel !== null ? (
              <div className="stamp accepted-stamp">
                <img src="/ai-ac.png" alt="AI Accepted" />
              </div>
            ) : (
              <div className="stamp accepted-stamp">
                <img src="/accepted.png" alt="Accepted" />
              </div>
            )}
          </>
        )}
        
        {c.acceptanceStatus === "rejected" && (
          <>
            {c.AiLabel !== null ? (
              <div className="stamp rejected-stamp">
                <img src="/ai-rejj.png" alt="AI Rejected" />
              </div>
            ) : (
              <div className="stamp rejected-stamp">
                <img src="/rejected.png" alt="Rejected" />
              </div>
            )}
          </>
        )}

         {c.acceptanceStatus === "waiting" && (
          <div className="stamp review-stamp">
            <img src="/review.png" alt="Rejected" />
          </div>
        )}

{c.status === "done" && (
  <div key={c._id} className="mark-as-packing">
    <button
      className={`toggle-button ${c.level === "packing" ? "active" : ""}`}
      onClick={c.level === "processing" ? () => handleCheckboxChange(c._id) : undefined} // Only add handler for processing
      disabled={loading}
    >
      {c.level === "processing" ? (
        <img src="/boxx.png" alt="Pack" className="icon-img" />
      ) : c.level === "packing" ? (
        <img src="/seal.png" alt="Packed"  className="icon-img"/>
      ) : c.level === "out for delivery" ? (
        <img src="/fast-shipping.png" alt="Out for Delivery" className="icon-img" />
      ) : c.level === "delivered" ? (
        <img src="/complete.png" alt="Delivered" className="icon-img" />
      ) : null}
    </button>
  </div>
)}

      </section>
    </div>
  ))}
</div>
{/* <div className="action-container">
  {cases.map((c) => (
    c.status === "done" && !packedCases.includes(c._id) &&  (
      <div key={c._id} className="mark-as-packing">
        <button
          className={`toggle-button ${c.level === "packing" ? 'active' : ''}`}
          onClick={() => handleCheckboxChange(c._id)}
          disabled={loading}
        >
          {c.level === "packing" ? "Packed" : "Mark as Packing"}
        </button>
      </div>
    )
  ))}
</div> */}
        </>
      )
      )}

{popupContent && (
  <div className="popuppp">
    <div className="popuppp-content">
      <div className="popuppp-header">
        <h1>Case Details</h1>
        <div className="closee" onClick={closePopup}>
          &times;
        </div>
      </div>
      <div className="popuppp-body">
        <p>
          Name: {popupContent.name}
        </p>
        <p>
          Title: {popupContent.title}
        </p>
        <p>
          Description: {popupContent.description}
        </p>
        <p>
        Items Needed:{" "}
        {Array.isArray(popupContent.itemsNeeded)
          ? popupContent.itemsNeeded.map(item => item.name).join(", ")  // Map to extract the name of each item
          : "No items specified"}
      </p>
        <div>
          <p className="salary-container">
          Salary: ${popupContent.salary}
  <span 
    className="check-document" 
    onClick={() => setShowSalaryModal(true)} 
    aria-label="View Salary Document"
  >
    📄 Check Document
  </span>
</p>

{showSalaryModal && (
  <div className="modal">
    <div className="modal-content">
      <span className="closee" onClick={() => setShowSalaryModal(false)}>&times;</span>
      <img 
        src={`${url}/images/${popupContent.salaryImage}`} 
        alt="Salary" 
        onLoad={() => setLoading(false)} 
        onError={() => setLoading(true)} 
      />
      {loading && <p>Loading...</p>}
        <button onClick={downloadImage} >Download</button>
    </div>
  </div>
)}
        </div>

        <p>
        Location:{" "}
          {popupContent.location?.address || "Location not available"}
      </p>
          {popupContent.phoneNumber && (
      <p>
        Phone Number: {popupContent.phoneNumber}
      </p>
    )}
      <p>Deadline: {new Date(popupContent.deadline).toLocaleString()}</p>
        <p>Target Group: {popupContent.targetGroup}</p>
        <div>
          <p className="salary-container">
          Case Type: {popupContent.caseType}
  <span 
    className="check-document" 
    onClick={() => setShowCaseTypeModal(true)} 
    aria-label="View Salary Document"
  >
    📄 Check Document
  </span>
</p>

{showCaseTypeModal && (
  <div className="modal">
    <div className="modal-content">
      <span className="closee" onClick={() => setShowCaseTypeModal(false)}>&times;</span>
      <img 
        src={`${url}/images/${popupContent.caseTypeImage}`} 
        alt="Salary" 
        onLoad={() => setLoading(false)} 
        onError={() => setLoading(true)} 
      />
      {loading && <p>Loading...</p>}
      <button onClick={downloadCaseTypeImage}>Download</button>
    </div>
  </div>
)}
        </div>
          <p>Urgency: {popupContent.urgency}</p>
        {popupContent.acceptanceStatus === "accepted" && (
          <>
            <p>
              Date Created:{" "}
              {new Date(popupContent.dateCreated).toLocaleString()}
            </p>
            <p>
              Status: {popupContent.status}
            </p>
            <p>
                  Availability:{" "}
                  {popupContent.availability === "available"
                    ? "Not taken"
                    : "Taken"}
                </p>
                <p>
                  Level: {popupContent.level}
                </p>
            <p>
              Helper Name: {popupContent.helperName}
            </p>
          </>
        )}
      </div>
      {(popupContent.acceptanceStatus === "waiting" ||
        popupContent.acceptanceStatus === "loading") && (
       <div className="action-buttons">
       <img
         src="/sah.png"
         alt="Accept"
         onClick={() => handleCaseAction("accepted")}
       />
       
       {/* Reject Action - Cross Image */}
       <img
         src="/crossIcon.png"
         alt="Reject"
         onClick={() => handleCaseAction("rejected")}
       />
     </div>
     
      )}
    </div>
  </div>
)}

    </div>
  );
};

export default AdminCasesPage;