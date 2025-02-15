import React, {useEffect} from "react";
import "./GeneralLoader.css";

const GeneralLoader = ({ message = "Preparing your donation journey..." }) => {
  
  useEffect(() => {
    // Disable scrolling when the loader is mounted
    document.body.style.overflow = "hidden";

    // Re-enable scrolling when the loader is unmounted
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  
  
  
  
  return (
    <div className="general-loader">
      {/* Background animation */}
      <div className="background-animation"></div>

      {/* Loader content */}
      <div className="loader-content">
        <img src="/boxa.gif" alt="Loaddding..." className="loader-gif" />
        <h2 className="loader-message">{message}</h2>
        <p className="loader-subtext">Every click brings hope. Thank you for your kindness!</p>
        <div className="loader-progress">
          <span className="progress-bar"></span>
        </div>
      </div>
    </div>
  );
};

export default GeneralLoader;
