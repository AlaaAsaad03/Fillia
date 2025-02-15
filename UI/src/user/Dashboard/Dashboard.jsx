import React from "react";
import "./Dashboard.css";
import UserNavbar from "../UserNavbar/UserNavbar";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import Welcome from "../Welcome/Welcome";
import { Outlet } from "react-router-dom";
const Dashboard = () => {
  return (
    
    <div className="dashboard-containerr">
     <div className="background-blurr"></div>
      <div className="dashboard-contentt">
      <Outlet />
        </div>
      </div>

  );
};

export default Dashboard;
