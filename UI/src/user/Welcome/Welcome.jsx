import React from 'react';
import { useAuthStore } from '../../context/authStore'; // Adjust the path as necessary
import AnimatedText  from '../ExploreMenu/AnimatedText'; // Adjust the import path
import './Welcome.css';

const Welcome = () => {
  const { user } = useAuthStore(); // Access the user object

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="hero-title-container">
          <div className="hero-titlee">
            <AnimatedText className="hero-titlee" text={`Welcome, ${user ? user.name : 'there'}!`} />
          </div>
        </div>
        <div className="subtitle-image-container">
          <p className="hero-subtitlee">
            <AnimatedText text="Explore your dashboard and manage your activities with ease! Discover new features, track your progress, and enhance your experience like never before!" />
          </p>
          <div className="hero-illustration">
            <img src="/Delivery Service.gif" alt="User" className="user-imagee" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
