import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import axios from "axios";

const DeliveredBar = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/statistics/cases-delivered");
        const transformedData = response.data.data.map((item) => ({
          name: item._id,
          sales: item.count,
        }));
        setSalesData(transformedData);
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
      className="bg-transparent p-8 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
        Cases Delivered Per Day
      </h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={salesData} barSize={35}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#374151" />
            <YAxis stroke="#374151" />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderColor: "tomato",
                borderRadius: "8px",
                boxShadow: "none",
              }}
              itemStyle={{ color: "PrussianBlue" }}
            />
            <Bar dataKey="sales" fill="#FF6347" shape={(props) => (
              <motion.rect
                {...props}
                whileHover={{ scale: 1.1 }}
                initial={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            )} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default DeliveredBar;
