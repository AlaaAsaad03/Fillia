import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import axios from "axios";
import "./CategoryBreakdown.css";

// Define a color palette similar to the second chart
const COLORS = ["#FF6347", "#6A5ACD", "#90EE90", "#FFD700", "#1E3A8A", "#00C49F"];

const CategoryBreakdown = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:4000/api/dashboard/order-category-breakdown",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        if (response.data.success) {
          console.log(response.data.data); // Log the response data
          const data = response.data.data;
          const transformedData = data.map((item) => ({
            category: item.subcategory,  // Access the 'name' property of the subcategory object
            value: item.totalAmount,
          }));
          
  
          setChartData(transformedData);
          setLoading(false);
        }
      } catch (error) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <motion.div
      className="category-breakdown-container card-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="card-title">Order Category Breakdown</h2>

      {/* Pie chart container */}
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <PieChart>
          <Pie
  data={chartData}
  cx="50%"
  cy="50%"
  outerRadius={110}  // Donut effect
  innerRadius={80}   // Inner radius for donut effect
  dataKey="value"
  label={({  percent }) => ` ${(percent * 100).toFixed(0)}%`}
  animationDuration={1000}  // Smooth animation
  startAngle={90}  // Starting angle for the pie chart
  endAngle={450}   // Full circle rotation
  isAnimationActive={true}  // Enable animation
>
  {chartData.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
  ))}
</Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "transparent",
              }}
              itemStyle={{ color: "#E5E7EB" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default CategoryBreakdown;
