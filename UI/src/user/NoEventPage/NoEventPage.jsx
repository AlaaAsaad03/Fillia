import { motion } from "framer-motion";
import { FaRegSadTear } from "react-icons/fa";
import { Navigate } from "react-router-dom";

export default function NoEventsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-6 bg-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center"
      >
        <FaRegSadTear className="text-6xl text-tomato mb-4" />
        <h2 className="text-2xl font-bold text-tomato">No Events Available</h2>
        <p className="text-gray-600 mt-2">Stay tuned for upcoming charity events!</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="mt-6"
      >
        <button className="bg-tomato hover:bg-tomato text-white px-6 py-2 rounded-lg" onClick={Navigate("/")}>
          Explore Other Initiatives
        </button>
      </motion.div>
    </div>
  );
}
