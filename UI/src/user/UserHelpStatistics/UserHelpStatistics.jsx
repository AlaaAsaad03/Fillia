import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import "./UserHelpStatistics.css"; // Ensure this contains styles for card

const UserHelpStatistics = () => {
  const [totalHelpedItems, setTotalHelpedItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token"); 
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;

  useEffect(() => {
    const fetchUserHelpStatistics = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/dashboard/help",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setTotalHelpedItems(response.data.totalHelpedItems);
        }
      } catch (err) {
        setError("Failed to fetch user help statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchUserHelpStatistics();
  }, []);

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <motion.div
      className="user-help-statistics-container card-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{ height: '400px', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: "transparent" }}
    >
      <h2 className="card-title">Total Helped Items</h2>
      <p className="total-helped-items">
         {totalHelpedItems}
         
      </p>
    </motion.div>
  );
};

export default UserHelpStatistics;