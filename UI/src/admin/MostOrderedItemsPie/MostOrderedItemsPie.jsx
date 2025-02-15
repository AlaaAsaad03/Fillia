import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

const COLORS = ["#FF6347", "#6A5ACD", "#90EE90", "#FFD700", "#1E3A8A", "#00C49F"]; // Tomato, Prussian Blue, and other colors

const MostOrderedItemsPie = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/statistics/most-ordered-items');
        const data = await response.json();

        // Transform the data into the format required by the PieChart
        const transformedData = data.data.map(item => ({
          name: item._id,  // Item name
          value: item.totalOrdered, // Total quantity ordered
        }));

        setChartData(transformedData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <motion.div
    className="bg-transparent p-8 rounded-xl shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">        Most Ordered Items
      </h2>
      
      {/* Pie chart container */}
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={110}  // Adjusted outer radius for 3D effect
              innerRadius={80}   // Donut effect
              dataKey="value"
              label={({ percent }) => ` ${(percent * 100).toFixed(0)}%`}
              animationDuration={1000}  // Smooth animation
              startAngle={90}  // Starting angle for the pie chart
              endAngle={450}  // Full circle rotation
              isAnimationActive={true}  // Enable animation
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "transparent", // Removed border
              }}
              itemStyle={{ color: "#E5E7EB" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default MostOrderedItemsPie;
