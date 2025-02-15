import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import GeneralLoader from "../../components/GeneralLoader/GeneralLoader";
import "./AnalyticsEventPage.css";

const AnalyticsEventPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [filteredEvents, setFilteredEvents] = useState([]); // State for filtered list
  const token = localStorage.getItem("token");

  let adminId = null;
  let adminRole = "";
  console.log("Token",token);
  
  let type = null;

if (token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
    adminId = payload.id;
    adminRole = payload.role;

    if (!adminId) {
      console.error("Admin ID is missing from the token.");
    }
  } catch (error) {
    console.error("Invalid token format:", error);
  }
}

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:4000/api/event/generate-analytics");
      if (data && Array.isArray(data.results)) {
        setEvents(data.results);
        setFilteredEvents(data.results); // Set initial filtered list
      } else {
        setEvents([]);
        setFilteredEvents([]);
      }
    } catch (error) {
      toast.error("Error fetching events or analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter the list based on search query
    if (query === "") {
      setFilteredEvents(events); // Show all events if no search query
    } else {
      setFilteredEvents(
        events.filter((event) =>
          event.title.toLowerCase().includes(query)
        )
      );
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

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
        <GeneralLoader message="Loading completed events..." />
      ) : (
        <div className=" flex-col">
             <div className="header-bar">
                        <div className="search-and-filter">
            <div className="searchh-barr">
              <i className="search-iconn fas fa-search"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="By Name or Date..."
                />
              </div>
              <div className="filter-buttonss">
                <button onClick={() => handleSort('newest')} className="filter-buttonn">Newest</button>
                <button onClick={() => handleSort('oldest')} className="filter-buttonn">Oldest</button>
              </div>
            </div>
                
                        </div>

                        <div className="listt-tablee">
  <div className="list-table-formatt title">
    <b>Title</b>
    <b>Start Date</b>
    <b>End Date</b>
    <b>Total Participants</b>
    <b>Total Items-Cases</b>
    <b>Total Revenue</b>
  </div>
  {filteredEvents.map((event) => {
    const eventAnalytics = event.analytics || {};
    return (
      <div key={event.eventId} className="list-table-formatt"> {/* FIXED CLASS NAME */}
        <p className="new-tit">{event.title || "N/A"}</p>
        <p>{new Date(event.startDate || Date.now()).toLocaleDateString()}</p>
        <p>{new Date(event.endDate || Date.now()).toLocaleDateString()}</p>
        <p>{eventAnalytics.totalParticipants || 0}</p>
        <p>{eventAnalytics.totalItemsSold || eventAnalytics.totalCases || 0}</p>
        <p>{eventAnalytics.totalRevenue || 0}</p>
      </div>
    );
  })}
</div>

        </div>
      )}
    </div>
  );
};

export default AnalyticsEventPage;