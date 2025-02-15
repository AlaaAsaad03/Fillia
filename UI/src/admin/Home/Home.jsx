import React, { useState } from "react";
import { useAuthStore } from "../../context/authStore";
import AnimatedText  from "../../user/ExploreMenu/AnimatedText"; // Adjust the import path
import "./Home.css";
import { useNavigate } from "react-router-dom";

const AdminHome = ({ searchTerm }) => {
  const { user } = useAuthStore(); // Access the admin object
  const navigate = useNavigate();

  const roleImages = {
    Leader: "./Singing Contract.gif",
    Packager: "./Worker packing the goods (1).gif",
    Delivery: "./Deliveryman Riding scooter.gif",
  };


  // Dynamic Buttons for Each Role
  const renderButtons = () => {
    switch (user.role) {
      case "Leader":
        return (
          <>
            <button className="primary-btn" onClick={() => navigate("/admin/requests")}>
              Review Requests
            </button>
            <button className="secondary-btn" onClick={() => navigate("/admin/cases")}>
              Manage Cases
            </button>
          </>
        );
      case "Packager":
        return (
          <>
            <button className="primary-btn" onClick={() => navigate("/admin/packing")}>
              View Packing Assignments
            </button>
            <button className="secondary-btn" onClick={() => navigate("/admin/profile")}>
              Edit Your Profile
            </button>
          </>
        );
      case "Delivery":
        return (
          <>
            <button className="primary-btn" onClick={() => navigate("/admin/delivery")}>
              View Delivery Routes
            </button>
            <button className="secondary-btn" onClick={() => navigate("/admin/profile")}>
            Edit Your Profile
            </button>
          </>
        );
      default:
        return null;
    }
  };


  return (
    <div className="main-contentt">
      {/* Page Title */}
      <h1 className="page-title-adminhome">
        <AnimatedText text={`Welcome Back, ${user ? user.name : "Admin"}!`} />
      </h1>

      {/* Hero Section */}
      <div className="hero-sectionn">
        <div className="welcome-content">
          <p className="hero-subtitle">
            <AnimatedText text="Your dedication keeps everything running smoothly. Stay focused, work efficiently, and let’s make today a success!" />
          </p>
          {/* Quick Action Buttons */}
          <div className="quick-actions">
          {renderButtons()}

          </div>
        </div>

        {/* Role-Based Illustration */}
        <div className="hero-illustration">
          <img
            src={user && roleImages[user.role] ? roleImages[user.role] : "./defaultImage.png"}
            alt="Role-based illustration"
            className="animated-spline"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
