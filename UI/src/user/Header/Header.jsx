import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import "./Header.css";

const Header = () => {
  const [isVisible, setIsVisible] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Set visibility based on whether the header is in view
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 } // Adjust threshold as needed
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
      }
    };
  }, []);

  const scrollToSection = () => {
    document.getElementById("counter").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header 
      ref={headerRef} 
      className="relative pt-0 pb-0 bg-white overflow-hidden"
    >
      {/* Background image */}
      <motion.img
        src="hdr.png"
        alt="Background"
        className="r-[2%] w-83 h-75 ml-7 object-cover transform -translate-y-5"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: isVisible ? 1 : 0.9,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Overlay text */}
      <motion.div
        className="absolute top-[60%] left-0 transform -translate-y-1 p-6 text-blue-800 text-xl md:text-2xl font-montserrat z-10 w-1/3  ml-7"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isVisible ? 1 : 0.8,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 1 }}
          className="leading-relaxed"
        >
          Together, we can transform lives. Your unique box is just a click
          away! Dive into our mission and let your creativity flow as you craft
          a bundle of love for those who need it most!
        </motion.h2>

        {/* Custom Button */}
        <motion.button
          onClick={scrollToSection}
          className="relative flex items-center px-6 py-3 overflow-hidden font-medium transition-all bg-orange-500 rounded-md group mt-4"
          initial={{ scale: 0.8 }}
          animate={{
            scale: isVisible ? 1 : 0.8,
          }}
          transition={{ duration: 1, ease: "easeOut", delay: 1 }}
        >
          <span className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-orange-700 rounded group-hover:-mr-4 group-hover:-mt-4">
            <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white" />
          </span>
          <span className="absolute bottom-0 rotate-180 left-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-orange-700 rounded group-hover:-ml-4 group-hover:-mb-4">
            <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white" />
          </span>
          <span className="absolute bottom-0 left-0 w-full h-full transition-all duration-500 ease-in-out delay-200 -translate-x-full bg-orange-600 rounded-md group-hover:translate-x-0" />
          <span className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-white">
            Start Crafting
          </span>
        </motion.button>
      </motion.div>

      {/* Animated Charity Box */}
      <motion.img
        src="npd.png"
        alt="Charity Box"
        initial={{ scale: 0.8 }}
        animate={{
          scale: isVisible ? 1 : 0.8,
          x: isVisible ? [0, -20, 20, 0] : 0,
          y: isVisible ? [0, 10, -10, 0] : 0,
          rotate: isVisible ? [0, 5, -5, 0] : 0,
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute top-40 right-0 w-3/6 z-20 mr-0"
      />

      {/* Animated Ribbon */}
      <motion.img
        src="rib.png"
        alt="Ribbon"
        initial={{ scale: 0.8 }}
        animate={{
          scale: isVisible ? 1 : 0.8,
          x: isVisible ? [0, -20, 20, 0] : 0,
          y: isVisible ? [0, 10, -10, 0] : 0,
          rotate: isVisible ? [0, 5, -5, 0] : 0,
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute top-[44%] right-[43%] w-[15%] z-20"
      />

      
    </motion.header>
  );
};

export default Header;
