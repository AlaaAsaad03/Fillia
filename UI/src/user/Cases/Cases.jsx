import React, { useContext, useEffect, useState, useRef } from 'react';
import './Cases.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import CasesHeader from '../CasesHeader/CasesHeader';
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
import AnimatedText from '../ExploreMenu/AnimatedText';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../context/authStore';
import GeneralLoader from '../../components/GeneralLoader/GeneralLoader';
import { FaSearch } from 'react-icons/fa';
import Footer from '../Footer/Footer';
import { wholeDivideDurations } from '@fullcalendar/core/internal';

const Cases = () => {
  const [recommendedCases, setRecommendedCases] = useState([]);
  const [otherCases, setOtherCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true); 
  const { url, addToCart } = useContext(StoreContext);
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState('newest');
  const token = localStorage.getItem("token");
  let userId = null; 
  const [budgetNeeded, setBudgetNeeded] = useState(1000);
  const [markedNotInterested, setMarkedNotInterested] = useState([]);
  const casesRef = useRef(null); // Reference for the cases container
  const [isPublicUser, setIsPublicUser] = useState(false);
  const { isAuthenticated } = useAuthStore();

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.id;
    } catch (error) {
      console.error("Invalid token format:", error);
    }
  }
  
 

  useEffect(() => {
    if (token) {
      fetchCases();
    } else {
      setIsPublicUser(true);
      fetchPublicCases();
    }
  }, [selectedCase]);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${url}/api/cases/getcase`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.data) {
        setRecommendedCases(response.data.recommendedCases || []);
        setOtherCases(response.data.otherCases || []);
      } else {
        setRecommendedCases([]);
        setOtherCases([]);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      setRecommendedCases([]);
      setOtherCases([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPublicCases = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${url}/api/cases/public-user-cases`);
      if (response.data.success) {
        setOtherCases(response.data.cases || []);
      } else {
        setOtherCases([]);
      }
    } catch (error) {
      console.error("Error fetching public cases:", error);
      setOtherCases([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeCase = async (caseId) => {
    if (!isAuthenticated) {
      toast.warning("You need to log in to take a case.", {
        position: "top-center",
      });
      setTimeout(() => {
        navigate(`/login?redirect=${window.location.pathname}`);
      }, 1500);
      return;
    }

    if (!caseId || selectedCase) {
      toast.warning("You cannot take more than one case at a time or the case is unavailable.", {
        position: "top-center",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.patch(
        `${url}/api/cases/${caseId}/take`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        toast.success("Case successfully taken!", {
          position: "top-center"
        });
        setSelectedCase(caseId);
        setOtherCases((prevCases) =>
          prevCases.map((c) =>
            c._id === caseId ? { ...c, availability: 'not available' } : c
          )
        );
        setTimeout(() => navigate("/dashboard/mycases"), 1500);
      }
    } catch (error) {
      console.error('Error taking case:', error);
      toast.error(error.response?.data?.message || "Could not take the case. Please try again.", {
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDonateItem = async (caseId, itemId) => {
    try {
      if (!userId) {
        alert("User ID is missing. Please log in.");
        return;
      }
      const confirmDonation = window.confirm("Confirm donation of this item?");
      if (!confirmDonation) {
        return;
      }
      const response = await axios.post(
        `${url}/api/cases/donate-item`,
        { userId, caseId, itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Item added to your box! Redirecting...');
        await addToCart(itemId);
        navigate('/cart');
        fetchCases();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error donating item:", error);
      alert(error.response?.data?.message || "An error occurred");
    }
  };

  const handleSort = (order) => {
    setSortOrder(order);
    const sortedCases = [...otherCases].sort((a, b) => {
      const dateA = new Date(a.dateCreated);
      const dateB = new Date(b.dateCreated);
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
    setOtherCases(sortedCases);
  };

  const filteredRecommendedCases = recommendedCases.filter((caseItem) =>
    caseItem.title && caseItem.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOtherCases = otherCases.filter((caseItem) =>
    caseItem.title && caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    caseItem.budgetNeeded <= budgetNeeded
  );

  const handleInterested = () => {
    console.log("User is interested in the recommended cases.");
  };

  const handleNotInterested = async () => {
    const caseIds = recommendedCases.map((caseItem) => caseItem._id);
    try {
      const response = await axios.post(
        `${url}/api/recommendations/mark-not-interested`,
        { userId, caseIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        alert("Marked as not interested successfully.");
        setMarkedNotInterested(caseIds);
      }
    } catch (error) {
      console.error("Error marking cases as not interested:", error);
      alert("Failed to mark cases as not interested.");
    }
  };

 

  const casesContainerRef = useRef(null);

  const scrollLeft = () => {
    if (casesContainerRef.current) {
      casesContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (casesContainerRef.current) {
      casesContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };


  return isLoading ? (
    <GeneralLoader message="Fetching cases... Please hold on." />
  ) : (
    <div className="cases-page-whole">
    <div className="cases-page-container">
      <motion.div className="title">
          <AnimatedText text="Every Case Holds a Story of Hope" className='t1' />
          <AnimatedText text="Fill a Case, Change a Life!" className='t2' />
      </motion.div>
      
          <div className="search-filter-containerr">
            <div className="search-bar-container">
              <FaSearch className="search-iconnn" />
              <input type="text"
                className="search-bar"
                placeholder="Search cases by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search cases"
              />
            </div>
        <div className="cases-header-right">
          <div className="cases-filter-container">
            <label htmlFor="budget-slider" className="budget-label">Budget:</label>
            <input 
              type="range" 
              id="budget-slider"
              min="0" 
              max="1000" 
              step="10" 
              value={budgetNeeded} 
              onChange={(e) => setBudgetNeeded(e.target.value)}
              className="budget-slider"
            />
            <span className="budget-value">${budgetNeeded}</span>

            <label htmlFor="sort-select" className="sort-label"></label>
            <select id="sort-select" value={sortOrder} onChange={(e) => handleSort(e.target.value)} className="cases-sort-select">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>


      {token && (
        <div className="cases-recommendation-section" >
        <h2 className="cases-page-title">Recommended Selections</h2>

        <div className="cases-container" ref={casesContainerRef}>
          {filteredRecommendedCases.length > 0 ? (
            filteredRecommendedCases
              .filter((caseItem) => !markedNotInterested.includes(caseItem._id))
              .map((caseItem) => (
                <div
                  key={caseItem._id}
                  className={`cases-card ${caseItem.availability === "not available" ? "cases-unavailable" : ""}`}
                  style={{ opacity: caseItem.isApplicable ? 1 : 0.6 }}
                >
                  <img src="./pin.png" alt="Pin Icon" className="cases-pin-icon" />
                  <div className="cases-card-header">
                    <div className="cases-card-date">
                      {new Date(caseItem.dateCreated).toLocaleDateString()}
                    </div>
                    <div className="cases-card-title">{caseItem.title}</div>
                    <img src="./line.png" alt="" className="cases-line-under-title" />
                  </div>
                  <div className="cases-card-container">
                  <div className="case-items-container">
                  <ul className="cases-card-items">
                    {caseItem.itemsNeeded.map((item) => (
                      <li
                        key={item.id}
                        className={`cases-card-item ${item.isDonated ? 'cases-item-donated' : ''}`}
                        onClick={() => !item.isDonated && handleDonateItem(caseItem._id, item.id)}
                      >
                        {item.name} {item.isDonated && <span className='cases-item-donated-label'>(Donated)</span>}
                      </li>
                    ))}
                  </ul>
                  </div>
                  </div>
                  {caseItem.isApplicable && caseItem.availability === "available" && !selectedCase && (
                    <button className="cases-take-btn" onClick={() => handleTakeCase(caseItem._id)}>
                      Take This Case
                    </button>
                  )}
                </div>
              ))
          ) : (
            <div className="cases-no-cases-message">No recommended cases available.</div>
          )}
        </div>

        {filteredRecommendedCases.length > 0 && (
           <div className="interest-buttons-container">
          <div className="interest-buttons">
            <button onClick={handleInterested}>👍 Interested</button>
            <button onClick={handleNotInterested}>👎 Not Interested</button>
          </div>
        </div>
        )}
      </div>
      )}
      <h2 className='cases-page-title'>{token ? "Explore More Additional Cases" : "Join Us in Making a Difference Today"}
      </h2>
      <div className="cases-container" ref={casesContainerRef}>
        {filteredOtherCases.length > 0 ? (
          filteredOtherCases.map((caseItem) => (
            <div key={caseItem._id} className={`cases-card ${caseItem.availability === 'not available' ? 'cases-unavailable' : ''}`}  
            style={{ opacity: isPublicUser ? 1 : (caseItem.isApplicable ? 1 : 0.6) }}
            >
              <img src='./pin.png' alt="Pin Icon" className="cases-pin-icon" />
              <div className="cases-card-header">
                <div className="cases-card-date">
                  {new Date(caseItem.dateCreated).toLocaleDateString()}
                </div>
                <div className="cases-card-title">{caseItem.title}</div>
                <img src="./line.png" alt="" className='cases-line-under-title' />
              </div>
              <div className="cases-card-container">
                <div className="case-items-container">
                <ul className="cases-card-items">
                  {caseItem.itemsNeeded.map((item) => (
                    <li
                      key={item.id}
                      className={`cases-card-item ${item.isDonated ? 'cases-item-donated' : ''}`}
                      onClick={() => !item.isDonated && handleDonateItem(caseItem._id, item.id)}
                    >
                      {item.name} {item.isDonated && <span className='cases-item-donated-label'>(Donated)</span>}
                    </li>
                  ))}
                </ul>
                </div>
              </div>
              
              {caseItem.isApplicable && caseItem.availability === 'available' && !selectedCase && (
                <button className="cases-take-btn" onClick={() => handleTakeCase(caseItem._id)}>
                  Take This Case
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="cases-no-cases-message">No other cases available at the moment.</div>
        )}
      </div>

      {/* Scroll buttons */}
      <div className="scroll-buttons">
        <button className="scroll-button scroll-button-left" onClick={scrollLeft}>
          &#8592;
        </button>
        <button className="scroll-button scroll-button-right" onClick={scrollRight}>
          &#8594;
        </button>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default Cases;