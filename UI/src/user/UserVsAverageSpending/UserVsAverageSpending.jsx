import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";
import "./UserVsAverageSpending.css";

const UserVsAverageSpending = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    let userId = "";
                const token = localStorage.getItem("token");
              
                if (token) {
                  const payload = JSON.parse(atob(token.split(".")[1])); // Decodes the payload part of the JWT
                  userId = payload.id;
                }

    useEffect(() => {
        const fetchUserVsAverageSpending = async () => {
            try {
                

                const response = await axios.post(
                    "http://localhost:4000/api/dashboard/user-vs-average-spending",
                    { userId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    const { userSpending, averageSpending } = response.data.data;
                    // Format data for recharts
                    const data = [
                        { name: "Your Spending", spending: userSpending },
                        { name: "Average Spending", spending: averageSpending },
                    ];
                    setChartData(data);
                }
            } catch (err) {
                setError("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchUserVsAverageSpending();
    }, []);

    if (loading) return <p className="text-gray-300">Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
      <motion.div
      className="average-container card-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
  >
      <h2 className="card-title mb-4"> {/* Add margin-bottom here */}
          User vs Average Donation 
      </h2>
  
      <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
              <BarChart data={chartData} barSize={35}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#000" />
                  <YAxis stroke="#000000" />
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

export default UserVsAverageSpending;
