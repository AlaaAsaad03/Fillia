import React from 'react';
import './Statistics.css';
import StatCards from '..//StatCards/StatCards';
import RevenueChart from '../RevenueChart/RevenueChart';
import AcceptancePie from '../AcceptancePie/AcceptancePie';
import HelpedCasesBar from '../HelpedCasesBar/HelpedCasesBar';
import DeliveredBar from '../DeliveredBar/DeliveredBar';
import MostOrderedItemsPie from '../MostOrderedItemsPie/MostOrderedItemsPie';
import Map from '../../components/Map/Map';
import AdminStatistics from '../AdminStatistics/AdminStatistics';

const Statistics = () => {
        let adminRole = "";
        const token = localStorage.getItem("token");

      if (token){
        const payload = JSON.parse(atob(token.split(".")[1])); // Decodes the payload part of the JWT
        const adminId = payload.id;
        adminRole = payload.role;
        console.log("adminId", adminId)
        console.log("adminRole", adminRole)
      }
  const isAuthorized = adminRole === "Leader";

  return (
    <div className= {`main-contentt ${!isAuthorized ? "blurred" : ""}`}>
       {!isAuthorized && (
        <div className="lock-overlay">
          <i className="lock-icon">🔒</i>
          <p>Access Restricted</p>
        </div>
      )}
      {isAuthorized && (
        <>

      <main className="statistics-content">
        <section className="overview-section">
          <StatCards />
        </section>

        <section className="charts-section">
          <div className="charts-grid">
            <AcceptancePie />
            <DeliveredBar />
            <MostOrderedItemsPie />
          </div>
        </section>

        <section className="revenue-section">
        <HelpedCasesBar />
        </section>
        <section className="revenue-section">
          <RevenueChart />
        </section>

        <section className="revenue-section">
          <AdminStatistics />
        </section>
      </main>

      <footer className="map-section">
        <Map />
      </footer>
      </>
      )}
    </div>
  );
};

export default Statistics;
