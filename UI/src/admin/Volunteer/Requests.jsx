import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import GeneralLoader from '../../components/GeneralLoader/GeneralLoader';
import { FaRegEdit } from "react-icons/fa";
import './Requests.css';

Modal.setAppElement('#root');

const Requests = ({ url }) => {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    let adminId = null;
    let adminRole = "";
    const token = localStorage.getItem("token");
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
    } else {
        console.error("No token found in localStorage.");
    }

    useEffect(() => {

        // Fetch the requests initially
        fetchRequests();

    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:4000/api/request/allRequests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data.requests);
        } catch (err) {
            setError('Error fetching work requests');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestActionOrStatusChange = async (id, action) => {
        console.log(`Changing status for request ID: ${id}, Action: ${action}`); // Debug log

        try {
            const response = await axios.post(`http://localhost:4000/api/request/process-request/${id}`, { action }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Response from server:", response.data);
            // Remove the request from the state if action is 'reject'
            if (action === 'reject') {
                setRequests((prev) => prev.filter((r) => r._id !== id));
            } else {
                // Optionally, fetch updated requests after status change
                fetchRequests(); 
            }
        } catch (err) {
            console.error('Error processing request or updating status:', err);
        }
    };
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredRequests = requests.filter((request) =>
        request.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            {loading && isAuthorized ? (
                <GeneralLoader message="Fetching Users Suggestions, hold on tight..." />
            ) : (
                isAuthorized && (
                    <>
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
                                    <div className="request-card" key={request._id}>
                                        <span><strong className="identifier">Name:</strong> {request.name}</span>
                                        <span><strong className="identifier">Email:</strong> {request.email}</span>
                                        <span><strong className="identifier">Role:</strong> {request.role}</span>
                                        <span><strong className="identifier">Date:</strong> {new Date(request.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>

                                        {/* Status & Edit Icon Container */}
                                        <div className="status-container">
                                            <span className="identifier"> </span>
                                            <select 
                                                className="status-select"
                                                value={request.status} 
                                                onChange={(e) => handleRequestActionOrStatusChange(request._id, e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="accept">Accepted</option>
                                                <option value="reject">Rejected</option>
                                            </select>
                                            <FaRegEdit    className="icon" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )
            )}
        </div>
    );
};

export default Requests;
