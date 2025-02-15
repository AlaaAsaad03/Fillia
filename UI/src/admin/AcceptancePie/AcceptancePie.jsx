import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

// Acceptance Pie Component (AcceptancePie.jsx)
const COLORS = ["#FF6347", "#6A5ACD", "#90EE90", "#FFD700", "#1E3A8A", "#00C49F"];

const AcceptancePie = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/statistics/case-acceptance-status');
        const data = await response.json();
        const transformedData = data.data.map(item => ({
          name: item._id,
          value: item.count,
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
      <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
        Case Acceptance Status
      </h2>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={70}
              dataKey="value"
              label={({ percent }) => ` ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip/>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default AcceptancePie;
