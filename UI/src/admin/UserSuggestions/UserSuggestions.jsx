import { useEffect, useState } from 'react'; 
import axios from 'axios';
import Modal from 'react-modal';
import GeneralLoader from '../../components/GeneralLoader/GeneralLoader';
import './UserSuggestions.css';
import { FaRegEdit } from "react-icons/fa";

Modal.setAppElement('#root');

const UserSuggestions = ({url}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);    
    const [modalData, setModalData] = useState(null);
    const token = localStorage.getItem("token");
    let adminRole = "";

    if (token) {
        const payload = JSON.parse(atob(token.split(".")[1])); 
        adminRole = payload.role;
    }

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:4000/api/suggestion/list', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const pendingSuggestions = res.data.data.filter(s => s.status === 'pending');
            setSuggestions(pendingSuggestions);
        } catch (err) {
            setError('Error fetching suggestions');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const handleSearch = (e) => setSearchTerm(e.target.value);
    const filteredSuggestions = suggestions.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.price.toString().includes(searchTerm.toLowerCase())
    );

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.patch('http://localhost:4000/api/suggestion/update', 
                { suggestionId: id, status }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuggestions((prev) => prev.filter((s) => s._id !== id));
        } catch (err) {
            console.error('Error updating suggestion status');
        }
    };

    const openModal = (data) => setModalData(data);
    const closeModal = () => setModalData(null);

    if (loading) return <p>Loading suggestions...</p>;
    if (error) return <p>{error}</p>;

    const isAuthorized = adminRole === "Leader";

    return (
        <div className={`main-contentt ${!isAuthorized ? "blurred" : ""}`}>
            {!isAuthorized && (
                <div className="lock-overlay">
                    <i className="lock-icon">🔒</i>
                    <p>Access Restricted</p>
                </div>
            )}
            {loading ? (
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
                            <div className="suggestion-list">
                                {filteredSuggestions.map((suggestion) => (
                                    <div key={suggestion._id} className="suggestion-card">
                                        <div className="suggestion-image">
                                            <img
                                                src={`${url}/images/` + suggestion.image || '/default-image.png'}
                                                alt={suggestion.name}
                                                className="circular-image"
                                            />
                                        </div>

                                        <div className="suggestion-info">
                                            <span>{suggestion.name}</span>
                                            <span>In:</span>
                                            <span> {suggestion.subcategory?.name || 'N/A'}</span>
                                            <span>Quantity: </span>
                                            <span> {suggestion.quantity}</span>
                                            <span>Price: </span>
                                            <span>{suggestion.price}</span>
                                            <span> By:</span>
                                            <span> {suggestion.userId.name || 'Unknown User'}</span>
                                            <span>On:</span>
                                            <span>{new Date(suggestion.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
                                            </div>

                                        {/* Select and Pen Icon */}
                                        <div className="suggestion-actions">
                                            <select
                                                onChange={(e) => handleStatusUpdate(suggestion._id, e.target.value)}
                                                defaultValue="pending"
                                            >
                                                <option value="pending" disabled>Pending</option>
                                                <option value="accepted">Accept</option>
                                                <option value="rejected">Reject</option>
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

export default UserSuggestions;