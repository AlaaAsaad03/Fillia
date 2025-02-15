import React, { useEffect, useState, useContext } from "react";
import { motion, useAnimation } from "framer-motion";
import "./AboutUs.css";
import { StoreContext } from "../context/StoreContext";
import AnimatedText from "../ExploreMenu/AnimatedText";

const AboutUs = () => {
  const [cases, setCases] = useState([]);
  const controls = useAnimation();
  const { url } = useContext(StoreContext);

  

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/cases/public-user-cases");
        const data = await response.json();
        
        if (data.success) {
          setCases(data.cases.slice(0, 3)); 
        }
      } catch (error) {
        console.error("Error fetching cases:", error);
      }
    };
    fetchCases();
  }, []);

  const handleScroll = () => {
    const section = document.getElementById("about-us");
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      controls.start({ opacity: 1, y: 0 });
    } else {
      controls.start({ opacity: 0, y: 50 });
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [controls]);

  return (
    <motion.section
      className="about-us-wrapper"
      id="about-us"
      initial={{ opacity: 0, y: 50 }}
      animate={controls}
      transition={{ duration: 1 }}
    >
      <div className="title">
        <p className="n">- About Us -</p>
      </div>

      <div className="about-us-layout">
        <div className="who-we-are">
          <h2>Who Are We?</h2>
          <motion.div
            className="about-us-content"
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            transition={{ duration: 1 }}
          >
            <p>
              In the heart of a nation rebuilding itself, our mission is simple:
              to bring people together to support those in need. Through 
              <span className="highlight"> customizable donation boxes</span>,
              we empower individuals to make a difference.
            </p>
            <p>
              Whether it’s food, clothes, or heating supplies, you choose the 
              contents of the box, and we deliver it to those who need it most.
            </p>
            <p className="call-to-action">
              Let’s <span className="highlight">rebuild hope</span>, 
              <span className="highlight"> share warmth</span>, and make a difference <br />
              one box at a time.
            </p>
          </motion.div>
        </div>

        {/* Right Side - Floating Cases */}
        <div className="about-cards-container">
          <motion.img
            src="/e.png"
            alt="Donation Box"
            className="abt-pic"
            animate={{
              y: ["0%", "9%", "0%"],  // vertical float effect
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "loop", // Continuous looping animation
              ease: "easeInOut",  // Smooth movement
            }}
          />
        </div>
      </div>
    </motion.section>
  );
};

export default AboutUs;