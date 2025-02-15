import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

const Counter = () => {
  const [counters, setCounters] = useState({
    casesCompleted: 0,
    usersHelping: 0,
    itemsDonated: 0,
    volunteers: 0,
  });

  const counterValues = useRef({
    casesCompleted: 0,
    usersHelping: 0,
    itemsDonated: 0,
    volunteers: 0,
  });

  const ref = useRef(null);
  const isInView = useInView(ref, { triggerOnce: false });  // Allow multiple triggers

  useEffect(() => {
    if (isInView) {
      counterValues.current = {
        casesCompleted: 0,
        usersHelping: 0,
        itemsDonated: 0,
        volunteers: 0,
      };
      setCounters({ ...counterValues.current });

      const animateCounters = setInterval(() => {
        counterValues.current = {
          casesCompleted: Math.min(counterValues.current.casesCompleted + 5, 1200),
          usersHelping: Math.min(counterValues.current.usersHelping + 2, 850),
          itemsDonated: Math.min(counterValues.current.itemsDonated + 10, 15000),
          volunteers: Math.min(counterValues.current.volunteers + 1, 450),
        };

        setCounters({ ...counterValues.current });

        if (
          counterValues.current.casesCompleted === 1200 &&
          counterValues.current.usersHelping === 850 &&
          counterValues.current.itemsDonated === 15000 &&
          counterValues.current.volunteers === 450
        ) {
          clearInterval(animateCounters);
        }
      }, 50);

      return () => clearInterval(animateCounters); // Cleanup on unmount or when inView changes
    }
  }, [isInView]);  // Trigger on view changes

  return (
    <motion.div
      ref={ref}
      className="relative flex items-center justify-center bg-white border-t-2 border-b-2 border-gray-100 mt-[0%] "
      id="counter"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Background image with borders */}
      <img
        src="/ccc.png"
        alt="Background with fingerprints"
        className="w-4/6 max-w-full object-cover  rounded-lg "
      />
      
      <motion.img
        src="/5-removebg-preview.png"
        alt="Handprint bottom right"
        className="absolute bottom-[5%] left-[1%] w-[20%] object-contain opacity-80"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      {/* Handprint animations */}
      <motion.img
        src="/5m-removebg-preview.png"
        alt="Handprint bottom right"
        className="absolute bottom-[5%] right-[-2%] w-[20%] object-contain opacity-80"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      
      {/* Counter positions with animations */}
      <div className="absolute top-[52%] left-[29%] translate-y-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1, y: [0, -20, 0] } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <p className="text-3xl font-extrabold text-orange-500 font-[Poppins]">
            {counters.casesCompleted}+
          </p>
          <p className="text-m text-blue-900 font-[Poppins] font-bold">
            Cases Completed
          </p>
        </motion.div>
      </div>
      
      <div className="absolute top-[52%] left-[42.5%] translate-y-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1, y: [0, -20, 0] } : {}}
          transition={{ duration: 1.1, ease: "easeOut" }}
        >
          <p className="text-3xl font-extrabold text-orange-500 font-[Poppins]">
            {counters.usersHelping}+
          </p>
          <p className="text-m text-blue-900 font-[Poppins] font-bold">
            Users Helping
          </p>
        </motion.div>
      </div>
      
      <div className="absolute top-[52%] left-[55.5%] translate-y-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1, y: [0, -20, 0] } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <p className="text-3xl font-extrabold text-orange-500 font-[Poppins]">
            {counters.itemsDonated}+
          </p>
          <p className="text-m text-blue-900 font-[Poppins] font-bold">Items Donated</p>
        </motion.div>
      </div>
      
      <div className="absolute top-[52%] left-[68%] translate-y-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1, y: [0, -20, 0] } : {}}
          transition={{ duration: 1.3, ease: "easeOut" }}
        >
          <p className="text-3xl font-extrabold text-orange-500 font-[Poppins]">
            {counters.volunteers}+
          </p>
          <p className="text-m text-blue-900 font-[Poppins] font-bold">Volunteers</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Counter;