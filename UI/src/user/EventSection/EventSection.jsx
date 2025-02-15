import React, { useEffect, useState, useContext } from "react";
import { motion, useAnimation } from "framer-motion";
import "./EventSection.css";
import { StoreContext } from "../context/StoreContext";
import AnimatedText from "../ExploreMenu/AnimatedText";
import { useNavigate } from "react-router-dom";

const EventSection = () => {
  const [cases, setCases] = useState([]);
  const controls = useAnimation();
  const { url } = useContext(StoreContext);
  const token = localStorage.getItem("token");
  let adminRole = "";

  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decodes the payload part of the JWT
    adminRole = payload.role;
    console.log("adminRole", adminRole);
  }
  const navigate = useNavigate();


  
  const handleScroll = () => {
    const section = document.getElementById("event-section");
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      controls.start({ opacity: 1, y: 0 });
    } else {
      controls.start({ opacity: 0, y: 50 });
    }
  };
  const handleButtonClick = () => {
      if (token) {
        navigate("/events");
      } else {
        navigate("/login"); 
      }
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [controls]);

  return (
    <motion.section
      className="EventSection-wrapper"
      id="event-section"
      initial={{ opacity: 0, y: 50 }}
      animate={controls}
      transition={{ duration: 1 }}
    >
      <div className="title">
        <p className="n">- Events -</p>
      </div>

      <div className="about-event-layout ">
        <div className="who-we-are">
         <img src="e (1).png" alt="" className="event-section-img"/>
         <button className="events-btns" onClick={handleButtonClick}>
                View Items
              </button>
        </div>
        <img src="/Fillia (6) (1).png" alt="" className="arw-event-section"/>
        <motion.img
          src="/Fillia (7).png"
          alt=""
          className="calender"
          animate={{
            rotate: [0, 5, -5, 5, -5, 0], // Wiggle effect
          }}
          transition={{
            repeat: Infinity,
            duration: 2, // Adjust for speed
            ease: "easeInOut",
          }}
        />
        <img src="/e (3).png" alt="" className="event-section-textt"/>
      </div>
    </motion.section>
  );
};

export default EventSection;