import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import axios from "axios";
import "./OurTeam.css";
import RequestWork from "../RequestWork/RequestWork";

const textVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeInOut", delay },
  }),
};

const OurTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showWorkPopup, setShowWorkPopup] = useState(false);

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/admin/all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          setTeamMembers(response.data.data);
        } else {
          console.error("Failed to fetch admin data:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    };

    fetchTeamMembers();
  }, []);

  return (
    <>
      <motion.div className="team-section">
        {/* Section Title */}
        <motion.div className="title" variants={textVariants} initial="hidden" whileInView="visible">
          <p className="n">- Meet Us -</p>
        </motion.div>

        <div className="our-team">
          <h2>Where Impact Begins</h2>
        </div>

        <div className="team-content-container">
          {/* Circular Layout Animation */}
          <motion.div
            ref={containerRef}
            className="team-circle-layout"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
          >
            {teamMembers.map((member, index) => {
              const angle = (360 / teamMembers.length) * index;
              const x = Math.cos((angle * Math.PI) / 180) * 200;
              const y = Math.sin((angle * Math.PI) / 180) * 200;

              return (
                <motion.div
                  key={index}
                  className={`circle-photo ${selectedMember?.name === member.name ? "active" : ""}`}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  onClick={() => setSelectedMember(member)}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={member.photo || "/default-user.png"}
                    alt={member.name}
                    className="team-photo"
                  />
                </motion.div>
              );
            })}

            {/* Center Info */}
            <motion.div
              className={`center-info ${selectedMember ? "fade-in" : ""}`}
              key={selectedMember?.name || "default"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={selectedMember ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5 }}
            >
              {selectedMember && (
                <>
                  <div className="selected-photo-wrapper">
                    <img
                      src={selectedMember.photo || "/default-user.png"}
                      alt={selectedMember.name}
                      className="selected-photo"
                    />
                  </div>
                  <h3>{selectedMember.name}</h3>
                  <p>{selectedMember.role}</p>
                  <div className="social-links">
                    <a href="#"><FaFacebook /></a>
                    <a href="#"><FaTwitter /></a>
                    <a href="#"><FaLinkedin /></a>
                    <a href="#"><FaInstagram /></a>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Scrolling Text Animations */}
          <motion.div
            className="creative-text-large"
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            custom={0.3}
          >
            <h1>Discover the amazing people making it happen!</h1>
            <motion.p variants={textVariants} initial="hidden" whileInView="visible" custom={0.6}>
              Click on any team member to learn about their role and connect through social media.
            </motion.p>
          </motion.div>
        </div>

        {/* Heartbeat Animation */}
        <motion.img
          src="hrt - Copy.png"
          alt=""
          className="hrt"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />

        {/* Motivational Call to Action */}
        <motion.div
          className="motivational-text"
          style={{ cursor: "pointer" }}
        >
          <div  onClick={() => setShowWorkPopup(true)}>
          <p> Join us in making a difference!</p>
          </div>
          <motion.img src="/arw.png" alt="" className="arw" />
        </motion.div>
      </motion.div>

      {/* Work Request Popup */}
      {showWorkPopup && <RequestWork onClose={() => setShowWorkPopup(false)} />}
    </>
  );
};

export default OurTeam;
