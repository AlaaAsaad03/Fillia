import React, { useEffect, useState, useContext } from "react";
import { motion, useAnimation } from "framer-motion";
import "./CaseSection.css";
import { StoreContext } from "../context/StoreContext";
import AnimatedText from "../ExploreMenu/AnimatedText";

const CaseSection = () => {
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
    const section = document.getElementById("cases");
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
      className="cases-section-wrapper"
      id="cases"
      initial={{ opacity: 0, y: 50 }}
      animate={controls}
      transition={{ duration: 1 }}
    >
      <div className="title">
        <p className="n">- Cases -</p>
      </div>

      <div className="cases-section-layout">
        <div className="who-we-are">
          <h2> Where Impact Begins !</h2>
          <motion.div
            className="cases-section-content"
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            transition={{ duration: 1 }}
          >
            <p className="call-to-action-cases">
            Your generosity isn’t just a <span className="highlight">donation</span>, it’s a lifeline. 
              Many needs, one <span className="highlight">ACTION.</span>  <br />
              Your support fuels <span className="highlight">CHANGE</span>.
            </p>
          </motion.div>
        </div>

        {/* Right Side - Floating Cases */}
        <div className="about-cards-container">
          {cases.map((caseItem, index) => (
            <motion.div
              key={caseItem.id}
              className="about-card"
              initial={{ rotate: index % 2 === 0 ? -6 : 4, y: -10 }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src="./pin.png" alt="Pin Icon" className="about-pin-icon" />
              <div className="about-card-header">
                <div className="about-card-date">{new Date(caseItem.dateCreated).toLocaleDateString()}</div>
                <div className="about-card-title">{caseItem.title}</div>
                <img src="./line.png" alt="" className="cases-line-under-title" />
              </div>
              <div className="about-card-container">
                <ul className="cases-card-items">
                  {caseItem.itemsNeeded.map((item) => (
                    <li
                      key={item.id}
                      className={`cases-card-item ${item.isDonated ? '' : ''}`}
                      onClick={() => !item.isDonated && handleDonateItem(caseItem._id, item.id)}
                    >
                      {item.name} 
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="discover-container">
        <i className="fas fa-arrow-right discover-icon"></i>
        <span className="discover-more" onClick={() => window.location.href = '/cases'}>
          Discover more cases
        </span>
      </div>
    </motion.section>
  );
};

export default CaseSection;