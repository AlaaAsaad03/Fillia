import React, { useContext, useEffect, useState } from "react";
import "./UserNavbar.css";
import { StoreContext } from "../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

const UserNavbar = () => {
  const { url, token, setToken } = useContext(StoreContext);
  const [user, setUser] = useState({
    name: "Loading...",
    profileImage: assets.default_profile,
  });
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const isActive = (path) => location.pathname === path;

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${url}/api/profile/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUser({
          name: response.data.user.name,
          profileImage: response.data.user.image || assets.default_profile,
        });
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
        setToken(null);
        localStorage.removeItem("token");
      }
    }
  };

  // Fetch notifications
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

  // Listen for notifications from the socket
  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchNotifications();
    }

    socket.on("notification", (notification) => {
      setNotifications((prev) => [...prev, notification]);
    });

    return () => {
      socket.off("notification");
    };
  }, [token]);

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
    if (showDropdown) {
      markNotificationsAsViewed();
    }
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
    <nav className="user-navbar">
      <div className="navbar-left">
        <Link to="/dashboard" className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}>
          <img src="/NewLogo.png" alt="Logo" />
        </Link>
      </div>
      <div className="navbar-right">
      <div className="notification-icon-user" onClick={handleDropdownToggle}>
  <img src={assets.notificaiton} alt="Notifications" className="navbar-icon-user" />
  {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
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
 <div className="navbar-profile">
          <img src={`${url}/images/${user.profileImage}`} alt="Profile" className="profile-img" />
          <span className="profile-name">{user.name}</span>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;