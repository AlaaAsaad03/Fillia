import React, {useState,useEffect, useContext} from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { FaBell, FaDoorOpen } from 'react-icons/fa'; // Importing icons
import axios from 'axios';
import { redirect, useNavigate } from 'react-router-dom';
import { AdminStoreContext } from '../context/AdminStoreContextProvider.jsx';
import { io } from "socket.io-client";
import { useAuthStore } from '../../context/authStore'


const AdminNavbar = ({ setShowLogin }) => {
  const socket = io("http://localhost:4000");

  const { token, setToken, url } = useContext(AdminStoreContext);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout, isAuthenticated,  } = useAuthStore(); 
  const navigate = useNavigate();

  
  const handleLogout = () => {
    logout();
    setToken("");
    navigate("/");
};


  const fetchNotifications = async () => {
    try {
      const response = await axios.post(`${url}/api/notifications/get`, {}, 
      {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  

    
    useEffect(() => {
    socket.on("notification", fetchNotifications);
  
    return () => {
      socket.off("notification", fetchNotifications); // Prevent duplicate listeners
    };
  }, [socket]);
  

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
    if (showDropdown) {
      markNotificationsAsViewed();
    }
  };

  const handleProfileClick = async () => {
    navigate('/admin/profile');
  };

  const markNotificationsAsViewed = async () => {
    // Call API to mark notifications as viewed
    await axios.post(`${url}/api/notifications/mark-as-viewed`, {},
     {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  


  const unreadCount = notifications.filter(n => !n.isViewed).length;

  return (
    <div className="navbar">
      <img className="logo" src="./NewLogo.png" alt="Company Logo" />
      {!isAuthenticated ? (
        <button onClick={() => setShowLogin(true)}>Sign In</button>
      ) : (
        <div className="profile-container">
          <img 
              className="profile" 
              src={user.image ? `${url}/images/${user.image}` : assets.profile_icon2}              alt="Profile" 
              onClick={handleProfileClick} 
              style={{ cursor: 'pointer' }}  
            />
          <div className="notification-bell" onClick={handleDropdownToggle}>
            <FaBell className="notification-icon" />
            {unreadCount > 0 && <span className="notification-countt">{unreadCount}</span>}
          </div>
          {showDropdown && (
  <div className="notification-dropdown">
    {notifications.length > 0 ? (
      notifications.map((notification) => (
        <div key={notification._id} className="notification-item">
          <div className="notification-item-icon">🔔</div> {/* Prefix Icon */}
          <div className="notification-item-message">{notification.message}</div>
          <div className="notification-item-time">
          {new Date(notification.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
          </div>
        </div>
      ))
    ) : (
      <div className="notification-item">
        <div className="notification-item-message">No notifications</div>
      </div>
    )}
  </div>
)}
<button className="logout-button" onClick={handleLogout}>
            <FaDoorOpen />
          </button>
        </div>
      )}
    </div>
  );

  
 
};

export default AdminNavbar;