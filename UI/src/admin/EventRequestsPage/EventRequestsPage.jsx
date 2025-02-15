import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import GeneralLoader from '../../components/GeneralLoader/GeneralLoader';
import { FaRegEdit } from "react-icons/fa";
import './EventRequestsPage.css';

Modal.setAppElement('#root');

const EventRequestsPage = ({ url }) => {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const [searchTerm, setSearchTerm] = useState('');

    let adminRole = "";

    if (token) {
        const payload = JSON.parse(atob(token.split(".")[1])); 
        adminRole = payload.role;
    }

   

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${url}/api/event/scheduled-requests`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
        
                console.log("API Response:", res.data); // Debugging
        
                 // Map over events and attach the event's `type` to each request
                    const allRequests = res.data.flatMap(event => 
                        (event.requests || []).map(request => ({
                            ...request,
                            eventType: event.type  // Attach event's `type` to the request
                        }))
                    );
                console.log("Processed Requests with Event Type:", allRequests);

                setRequests(allRequests);
            } catch (err) {
                setError('Error fetching work requests');
            } finally {
                setLoading(false);
            }
        };
        
    
        if (token) fetchRequests();

          // Set up polling to fetch requests every 5 seconds
    const intervalId = setInterval(fetchRequests, 60000); // 5000ms = 5 seconds

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
    }, [url, token]);
    

    const handleStatusChange = async (id, status, eventType) => {
        console.log("Request type:", eventType);
        try {
            await axios.put(`${url}/api/event/update-request-status`, { requestId: id, status, type: eventType }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests((prevRequests) => 
                prevRequests.map(request => 
                    request._id === id ? { ...request, status } : request
                )
            );
        } catch (err) {
            console.error('Error updating status:', err.response?.data || err.message);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredRequests = requests.filter((request) =>
        (request.name || "").toLowerCase().includes(searchTerm.toLowerCase()) // Default to empty string if name is undefined
    );
    

    const handleSort = (sortOrder) => {
        const sortedRequests = [...requests].sort((a, b) => {
            if (sortOrder === 'newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortOrder === 'oldest') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
            return 0;
        });
        setRequests(sortedRequests);
    };


    if (error) return <p>{error}</p>;

    const isAuthorized = adminRole === "Leader";
    if (loading && isAuthorized) return <GeneralLoader message="Fetching Work Requests..." />;

    return (
        <div className={`main-contentt ${!isAuthorized ? "blurred" : ""}`}>
            {!isAuthorized && (
                <div className="lock-overlay">
                    <i className="lock-icon">🔒</i>
                    <p>Access Restricted</p>
                </div>
            )}
            {isAuthorized && (
                <div className="content-container">
                     <div className="header-bar">
                                <div className="search-and-filter">
                                    <div className="searchh-barr">
                                        <i className="search-iconn fas fa-search"></i>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={handleSearch}
                                            placeholder="Search By Name..."
                                        />
                                    </div>
                                    <div className="filter-buttonss">
                                        <button onClick={() => handleSort('newest')} className="filter-buttonn">Newest</button>
                                        <button onClick={() => handleSort('oldest')} className="filter-buttonn">Oldest</button>
                                    </div>
                                </div>
                            </div>
                    <div className="request-list">
                    {filteredRequests.map((request) => (
                <div className="request-cardd" key={request._id}>                    
                    <span><strong className="identifierr">Title:</strong> {request.title || request.name}</span>
                    {request.amountRequired !== undefined && (
                        <>
                            <span><strong className="identifierr">Amount Required:</strong> {request.amountRequired}</span>
                            <span><strong className="identifierr">Amount Collected:</strong> {request.amountCollected}</span>
                        </>
                    )}

                    {request.price !== undefined && (
                                <>
                                    <span><strong className="identifierr">Price:</strong> {request.price}</span>
                                    <span><strong className="identifierr">Quantity:</strong> {request.quantity}</span>
                                </>
                            )}
                        <span><strong className="identifierr">User:</strong> {request.userId?.name || request.userId?.email || request.createrId?.name || "Unknown"}</span>
                        <span className="status-container">
                            <strong className="identifierr">Status:</strong>
                            <select 
                                className="status-selectt"
                                value={request.status} 
                                onChange={(e) => handleStatusChange(request._id, e.target.value, request.eventType)}                                 >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <FaRegEdit className="iconnn" />
                        </span>
                    </div>
                ))}

                    </div>
                </div>
            )}
        </div>
    );
};

export default EventRequestsPage;