import { useEffect, useState } from 'react';
import axios from 'axios';
import GeneralLoader from '../../components/GeneralLoader/GeneralLoader';
import './Feedbacks.css';
import { assets } from '../../assets/assets';

const Feedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    let adminRole = "";
  const token = localStorage.getItem("token");
  
  if(token){
  const payload = JSON.parse(atob(token.split(".")[1])); // Decodes the payload part of the JWT
  const adminId = payload.id;
   adminRole = payload.role;
  console.log("adminId", adminId)
  console.log("adminRole", adminRole)
}

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const res = await axios.get('http://localhost:4000/api/feedback/all');
                setFeedbacks(res.data.feedbacks);
            } catch (err) {
                setError('Error fetching feedbacks');
            } finally {
                setLoading(false);
            }
        };
        fetchFeedbacks();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSort = (order) => {
        setSortOrder(order);
        const sortedFeedbacks = [...feedbacks].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return order === 'newest' ? dateB - dateA : dateA - dateB;
        });
        setFeedbacks(sortedFeedbacks);
    };

    const filteredFeedbacks = feedbacks.filter((fb) =>
        fb.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.feedback.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:4000/api/feedback/delete/${id}`);
            setFeedbacks(feedbacks.filter((fb) => fb._id !== id));
        } catch (error) {
            console.error('Error deleting feedback');
        }
    };
    const isAuthorized = adminRole === "Leader";

    if (loading && isAuthorized) return <p>Loading feedbacks...</p>;
    if (error) return <p>{error}</p>;


    return (
        <div className={`main-contentt ${!isAuthorized ? "blurred" : ""}`}>
        {!isAuthorized && (
            <div className="lock-overlay">
                <i className="lock-icon">🔒</i>
                <p>Access Restricted</p>
            </div>
        )}
        {loading  && isAuthorized ? (
            <GeneralLoader message="Fetching Users Feedbacks, hold on tight..." />
        ) : (
            isAuthorized && (
                <div className="content-containerr">
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
                    <div className="feedback-list">
                        {filteredFeedbacks.map((fb) => (
                            <div key={fb._id} className="feedback-carddd">
                                <div className="feedback-headerr">
                                    <img
                                        src={`http://localhost:4000/images/${fb.userId.image}` || assets.user3}
                                        alt="User avatar"
                                        className="feedback-avatarr"
                                    />
                                    <p className="feedback-userr">{fb.userId.name}</p>
                                </div>
                                <p className="feedback-textt">{fb.feedback}</p>
                                <div className="feedback-footerr">
                                <p className="feedback-timestamp">
                                    {new Date(fb.createdAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                                <button
                                    className="delete-buttnon"
                                    onClick={() => handleDelete(fb._id)}
                                >
                                    🗑️ Delete
                                </button>
                            </div>

                            </div>
                        ))}
                    </div>
                </div>
            )
        )}
    </div>
    
        
    );
};

export default Feedbacks;