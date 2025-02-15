import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import axios from "axios";
import "./WeeklySpending.css";

const WeeklySpending = () => {
  const [spendingData, setSpendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:4000/api/dashboard/weekly-spending-pattern",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          const data = response.data.data;
          const transformedData = data.map((item) => ({
            name: item.day,
            spending: item.totalAmount,
          }));
          setSpendingData(transformedData);
        }
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-gray-300">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <motion.div
    className="category-breakdown-container card-container"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    >
      <h2 className="card-title">Weekly Spending Pattern</h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={spendingData} barSize={35}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#000" />
            <YAxis stroke="#000" />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderColor: "tomato",
                borderRadius: "8px",
                boxShadow: "none",
              }}
              itemStyle={{ color: "PrussianBlue" }}
            />
            <Bar
              dataKey="spending"
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

export default WeeklySpending;
