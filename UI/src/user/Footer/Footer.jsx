import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";
import { FaHome, FaInfoCircle, FaDonate, FaEnvelope, FaPhone, FaSearchLocation } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer" id="footer">
      {/* Section 1: Logo & Name */}
      <div className="footer-section logo-section">
        <img src='./Untitled design (4).png' alt="Fillia Logo" className="footer-logo" />
      </div>

      {/* Section 2: About & Social Links */}
      <div className="footer-section about-section">
      <h1 className="footer-name">Fillia</h1>

        <p>
          Join us in helping rebuild Lebanon. Your donation, customized by you,
          will bring hope and relief to families in need. Choose the items that
          make a difference, and we'll deliver them directly to those who need it most.
        </p>
        <div className="footer-social-icons">
          <img src={assets.facebook_icon} alt="Facebook" />
          <img src={assets.twitter_icon} alt="Twitter" />
          <img src={assets.linkedin_icon} alt="LinkedIn" />
        </div>

      </div>

      {/* Section 3: Quick Links */}
      <div className="footer-section quick-links">
        <h2>Quick Links</h2>
        <ul>
          <li ><FaHome /> Home</li>
          <li><FaInfoCircle /> About Us</li>
          <li ><FaDonate /> Donate</li>
          <li><FaEnvelope /> Contact</li>
        </ul>
      </div>

      {/* Section 4: Contact */}
      <div className="footer-section contact-section">
        <h2>Contact</h2>
        <ul>
          <li><FaPhone /> +961-123-4567</li>
          <li><FaEnvelope /> filliaspprt@gmail.com
          </li>
          <li><FaSearchLocation /> Beirut, Lebanon</li>
        </ul>
      </div>

      <hr />
      <div className="footer-bottom">
        &copy; 2024 Fillia. All Rights Reserved.
      </div>
      <hr className="hr-footer" /> 
    </footer>
  );
};

export default Footer;
