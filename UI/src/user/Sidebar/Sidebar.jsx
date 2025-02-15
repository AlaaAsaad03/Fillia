import React from "react";
import "./Sidebar.css";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebarr">
      <div className="sidebarr-logo">
        <img src="/nobg.png" alt="Fillia Logo" className="logo-image" />
        <h2 className="logo-text">Fillia</h2>
      </div>
      <div className="sidebarr-options">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "active sidebarr-option" : "sidebarr-option"
          }
          aria-label="Home"
        >
          <img src="/homee.png" alt="Home Icon" />
          <p>Home</p>
        </NavLink>
        <NavLink
          to="/dashboard/analysis"
          className={({ isActive }) =>
            isActive ? "active sidebarr-option" : "sidebarr-option"
          }
          aria-label="Analysis"
        >
          <img src="/analysis (1).png" alt="Analysis Icon" />
          <p>Analysis</p>
        </NavLink>

        <NavLink
          to="/dashboard/profile"
          className={({ isActive }) =>
            isActive ? "active sidebarr-option" : "sidebarr-option"
          }
          aria-label="Profile"
        >
          <img src="/userr.png" alt="Profile Icon" />
          <p>Profile</p>
        </NavLink>

        <NavLink
          to="/dashboard/mycases"
          className={({ isActive }) =>
            isActive ? "active sidebarr-option" : "sidebarr-option"
          }
          aria-label="Cases"
        >
          <img src="/case-studies.png" alt="Cases Icon" />
          <p>Donations</p>
        </NavLink>
        <NavLink
          to="/dashboard/createdcases"
          className={({ isActive }) =>
            isActive ? "active sidebarr-option" : "sidebarr-option"
          }
          aria-label="Created Cases"
        >
          <img src="/content-marketing.png" alt="Created Cases Icon" />
          <p>Requests</p>
        </NavLink>

        <NavLink
          to="/dashboard/my-items"
          className={({ isActive }) =>
            isActive ? "active sidebarr-option" : "sidebarr-option"
          }
          aria-label="Add Item"
        >
          <img src="/add-list.png" alt="Add Item Icon" />
          <p>Add Your Item</p>
        </NavLink>
        <NavLink
          to="/dashboard/chat"
          className={({ isActive }) =>
            isActive ? "active sidebarr-option" : "sidebarr-option"
          }
          aria-label="Chats"
        >
          <img src="/live-chat.png" alt="Chats Icon" />
          <p>Chats</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
