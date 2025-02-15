import React, { useState, useEffect } from "react";
import "./MapPanel.css";
import MapHome from "./Map";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";

// Custom hook for counter
const useCounter = (initialValue, incrementRange = [10, 30], speed = 100) => {
  const [counter, setCounter] = useState(initialValue);

  useEffect(() => {
    const interval = setInterval(() => {
      const increment = Math.floor(
        Math.random() * (incrementRange[1] - incrementRange[0]) + incrementRange[0]
      );
      setCounter((prev) => prev + increment);
    }, speed);

    return () => clearInterval(interval);
  }, [incrementRange, speed]);

  return counter;
};

const MapPanel = () => {
  const fakeCounter = useCounter(1000);
  const navigate = useNavigate();

  // Framer Motion - Intersection Observers (No "triggerOnce", so it resets on every scroll)
  const { ref: titleRef, inView: titleInView } = useInView({ triggerOnce: false });
  const { ref: containerRef, inView: containerInView } = useInView({ triggerOnce: false });
  const { ref: contentRef, inView: contentInView } = useInView({ triggerOnce: false });

  return (
    <div className="map-panel-section" aria-label="map-panel-section">
      {/* Title with motion */}
      <motion.div
        ref={titleRef}
        initial={{ opacity: 0, y: 50 }}
        animate={titleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="title"
      >
        <p className="n">- Delivered Cases -</p>
      </motion.div>

      <div className="map-layout">
        <div className="map-panel">
          {/* Map Section */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, x: -50 }}
            animate={containerInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="map-panel-container"
          >
            <h2>Every Box Counts!</h2>
            <div className="mapp">
              <MapHome />
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, x: 50 }}
            animate={contentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="map-panel-content"
          >
            <p>
              Your contributions are making a real <span className="highlight">difference</span> in the lives of those in need. 
              <span className="highlight"> Together</span>, we’re building a better tomorrow. <span className="highlight"> Click</span> on the box to start the journey<span className="highlight">!</span>
            </p>
            <div className="fingerprint-container">
              <img src="/bag.png" alt="Fingerprint" className="del" />
              <button className="items-btn" onClick={() => navigate("/items")}>
                View Items
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MapPanel;
