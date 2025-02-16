import React, { useState,useEffect, useContext } from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore';
import axios from 'axios';
import {  useNavigate } from 'react-router-dom';
import { AdminStoreContext } from '../context/AdminStoreContextProvider.jsx';
import { io } from "socket.io-client";

const AdminSidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);  // Track the open dropdown
  const { user, logout, isAuthenticated } = useAuthStore(); 
  const socket = io("http://localhost:4000");
  const {token,setToken, url } = useContext(AdminStoreContext);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();


  const handleLogout = () => {
    logout();  // Call your logout function here
    setToken("");
    navigate("/"); // Redirect to the home page
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
    if (isAuthenticated && token) {
        fetchNotifications();
    }
}, [isAuthenticated, token]);

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

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);  // Toggle dropdown
  };

  return (
    <div className='sidebarrr'>
      {/* Logo & Fillia Name */}
      <div className="sidebar-header">
        <img src={assets.nobg} alt="Fillia Logo" className="sidebar-logo" />
        <h2 className="sidebar-title">FILLIA</h2>
      </div>
      <div className="notification-container">
      <hr className="notification-divider" />
      <div onClick={handleDropdownToggle}>
      <img src={assets.Bell} alt="Notifications" className="notification-icon" />
      {unreadCount > 0 && <span className="notification-countt">{unreadCount}</span>}

      </div>
    </div>

    {showDropdown && (
  <div className="notification-dropdownn">
    {notifications.length > 0 ? (
      notifications.map((notification) => (
        <div key={notification._id} className="notification-item">
          <div className="notification-header">
            <div className="notification-item-icon">🔔</div> 
            <div className="notification-item-time">
              {new Date(notification.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
          <div className="notification-item-message">{notification.message}</div>
        </div>
      ))
    ) : (
      <div className="notification-item">
        <div className="notification-item-message">No notifications</div>
      </div>
    )}
  </div>
)}


      <div className="sidebar-options">
        {/* Content Management Dropdown */}
        <div 
          className="sidebar-option dropdown-toggle" 
          onClick={() => toggleDropdown('contentManagement')}
          aria-label="Manage Content"
        >
          <img src="/items.png" alt="" />
          <p className='catt'>Items</p>
          <span className={`arrow ${openDropdown === 'contentManagement' ? 'open' : ''}`}>&#9662;</span>
        </div>

        {/* Content Management Items */}
        {openDropdown === 'contentManagement' && (
          <div className="dropdown-content">
            <NavLink to='/admin/add' className="sidebar-option sub-option" aria-label="Content Management">
              <p>Edit</p>
            </NavLink>
            <NavLink to='/admin/list' className="sidebar-option sub-option" aria-label="List Items">
              <p>List</p>
            </NavLink>
            <NavLink to='/admin/suggestions' className="sidebar-option sub-option" aria-label="User Suggestions">
              <p>Requests</p>
            </NavLink>
          </div>
        )}

         <NavLink to='/admin/chat' className="sidebar-option" aria-label="Chat">
         <img src="./chat (1).png" alt="" />
          <p className='catt'>Chat</p>
        </NavLink>

        {/* Operations Dropdown */}
        <div 
          className="sidebar-option dropdown-toggle" 
          onClick={() => toggleDropdown('operations')}
          aria-label="Manage Operations"
        >
          <img src="/cases (2).png" alt="" />
          <p className='catt'>Cases</p>
          <span className={`arrow ${openDropdown === 'operations' ? 'open' : ''}`}>&#9662;</span>
        </div>

        {/* Operations Items */}
        {openDropdown === 'operations' && (
          <div className="dropdown-content">
            <NavLink to='/admin/cases' className="sidebar-option sub-option" aria-label="Cases">
              <p>Request</p>
            </NavLink>
            <NavLink to='/admin/orders' className="sidebar-option sub-option" aria-label="Donations">
              <p>Donations</p>
            </NavLink>
            {user.role === 'Packager' && (
            <NavLink to='/admin/packing' className="sidebar-option sub-option" aria-label="Packing">
              <p>Packing</p>
            </NavLink>
          )}
                  {user.role === 'Delivery' && (
              <NavLink to='/admin/delivery' className="sidebar-option sub-option" aria-label="Delivery">
                <p>Delivery</p>
              </NavLink>
            )}
          </div>
        )}

    <NavLink to='/admin/statistics' className="sidebar-option" aria-label="Statistics">
      <img src='/statistics.png' alt="vol Icon" />
          <p className='catt'>Statistics</p>
        </NavLink>

        {/* Event Dropdown */}
        <div 
          className="sidebar-option dropdown-toggle" 
          onClick={() => toggleDropdown('event')}
          aria-label="Manage Operations"
        >
         <img src='/event.png' alt="vol Icon" />

          <p className='catt'>Event</p>
         <span className={`arrow ${openDropdown === 'event' ? 'open' : ''}`}>&#9662;</span> 
        </div>

        {/* Event Items */}
        {openDropdown === 'event' && (
          <div className="dropdown-content">
            <NavLink to='/admin/event-management' className="sidebar-option" aria-label="Schedule">
              <p>Schedule</p>
            </NavLink>
            <NavLink to='/admin/event-requests' className="sidebar-option" aria-label="Requests">
              <p>Requests</p>
            </NavLink>
            <NavLink to='/admin/analytics' className="sidebar-option" aria-label="Analysis">
              <p>Analysis</p>
            </NavLink>
          </div>
        )}

        
     <NavLink to='/admin/requests' className="sidebar-option" aria-label="Volunteer">
          <img src='/volunteer.png' alt="vol Icon" />
          <p className='catt'>Volunteer</p>
        </NavLink>

        {/* Profile Dropdown */}
        <div 
          className="sidebar-option dropdown-toggle" 
          onClick={() => toggleDropdown('profile')}
          aria-label="Manage Profile"
        >
          <img src='/userr.png' alt="Cases Icon" />
          <p className='catt'>Profile</p>
          <span className={`arrow ${openDropdown === 'profile' ? 'open' : ''}`}>&#9662;</span>
        </div>

        {/* Profile Items */}
        {openDropdown === 'profile' && (
          <div className="dropdown-content">
            <NavLink to='/admin/profile' className="sidebar-option" aria-label="Edit Profile">
              <p>Edit</p>
            </NavLink>
            <div className="sidebar-option" onClick={handleLogout} aria-label="Log Out">
              <p>Log Out</p>
            </div>
          </div>
        )}

      <NavLink to='/admin/feedbacks' className="sidebar-option" aria-label="Feedbacks">
         <img src="/feedbacks.png" alt="" />
          <p className='catt'>Feedbacks</p>
        </NavLink>
        {/* Family Dropdown */}
        <div 
          className="sidebar-option dropdown-toggle" 
          onClick={() => toggleDropdown('family')}
          aria-label="Manage Family"
        >
        <img src='/members.png' alt="vol Icon" />

          <p className='catt'>Members</p>
          <span className={`arrow ${openDropdown === 'family' ? 'open' : ''}`}>&#9662;</span>
        </div>

        {/* Family Items */}
        {openDropdown === 'family' && (
          <div className="dropdown-content">
             <NavLink to='/admin/users' className="sidebar-option" aria-label="Users">
              <p>Users</p>
            </NavLink>
            <NavLink to='/admin/staff' className="sidebar-option" aria-label="Admins">
              <p>Admins</p>
            </NavLink>
           
          </div>
        )}

        {/* Other Links */}
       

       


     
      </div>
    </div>
  );
}

export default AdminSidebar;
