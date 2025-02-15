import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,ResponsiveContainer,} from "recharts";
import { format } from "date-fns";

const RevenueChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:4000/api/statistics/revenue-per-day"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch revenue data");
        }
        const { data } = await response.json();

        const formattedData = data
          .map((item) => ({
            month: format(new Date(item._id), "MMM dd"),
            donations: item.totalAmount,
          }))
          .sort((a, b) => new Date(a.month) - new Date(b.month));

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  return (
    <div className="relative w-full p-4" style={{ background: 'transparent' }}>
      {/* Main Title */}
      <div className="mb-6 text-center">
      </div>
  
      {/* Chart Container */}
      <motion.div
        className="relative rounded-xl p-6 mb-8"
        style={{
          background: "transparent", // Glassmorphism effect (optional)
          border: "2px solid transparent",
          borderImage: "linear-gradient(to right, tomato, PrussianBlue) 1",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Chart Title */}
        <div className="flex justify-center items-center mb-6">
        <div className="mb-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-4xl font-extrabold"
        style={{
          background: "linear-gradient(to right, tomato, #1E90FF)", // Vibrant gradient
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "1px",
          textShadow: "3px 3px 5px rgba(0, 0, 0, 0.3)", // Subtle shadow for depth
        }}
      >
        Overall Donations Overview
      </motion.h1>
    </div>
      </div>  
        {/* Chart or Loading State */}
        {loading ? (
          <div className="text-gray-300 text-center">Loading...</div>
        ) : (
          <div style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(25, 49, 72, 0.5)" />
                <XAxis
                  dataKey="month"
                  stroke="PrussianBlue"
                  tick={{ angle: -45, fontSize: 12 }}
                  interval={0}
                />
                <YAxis stroke="PrussianBlue" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "offwhite",
                    borderColor: "tomato",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "PrussianBlue" }}
                />
                <Area
                  type="monotone"
                  dataKey="donations"
                  stroke="tomato"
                  fill="tomato"
                  fillOpacity={0.15}
                  dot={{ stroke: "tomato", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RevenueChart;
