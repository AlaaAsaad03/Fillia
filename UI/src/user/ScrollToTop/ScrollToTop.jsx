import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show button when scrolling past 300px
      setVisible(scrollY > 300);

      // Detect if user is near the footer
      setNearFooter(scrollY + windowHeight >= documentHeight - 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.button
      onClick={scrollToTop}
      className="fixed p-3 bg-tomato text-white rounded-full shadow-lg"
      aria-label="Scroll to top"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9, rotate: 180 }}
      style={{
        right: "1.5rem",
        bottom: nearFooter ? "5rem" : "1.5rem", // Moves up when near footer
        position: "fixed",
        zIndex: 1000,
      }}
    >
      <ChevronUp size={24} />
    </motion.button>
  );
};

export default ScrollToTop;
