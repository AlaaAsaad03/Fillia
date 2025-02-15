import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import axios from "axios";
import "./CasesHelpedPerDay.css";

const CasesHelpedPerDay = () => {
  const [casesData, setCasesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCasesHelpedPerDay = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming auth token is stored in localStorage
        const response = await axios.post(
          "http://localhost:4000/api/dashboard/cases-helped-per-day",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          const data = response.data.data;
          const transformedData = data.map((item) => ({
            date: item.date,
            cases: item.count,
          }));
          setCasesData(transformedData);
        }
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchCasesHelpedPerDay();
  }, []);

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <motion.div
      className="cases-helped-container card-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="card-title"> {/* Centered Title */}
        Cases Helped Per Day
      </h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={casesData} barSize={35}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#000" />
            <YAxis stroke="#000" />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderColor: "#374151",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{ color: "#C38B19" }}
            />
            <Bar
              dataKey="cases"
              fill="#FF6347"
              shape={(props) => (
                <motion.rect
                  {...props}
                  whileHover={{ scale: 1.05 }}
                  initial={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              )}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default CasesHelpedPerDay;
