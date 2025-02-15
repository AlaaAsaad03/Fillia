import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion'; // Import motion for animations
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminStatistics = () => {
    const [statistics, setStatistics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/statistics/Admin-stat', {
                    headers: {
                        // Include your token or other headers if necessary
                        Authorization: `Bearer ${token}`,
                    }
                });
                setStatistics(response.data.statistics);
            } catch (err) {
                setError("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    // Prepare data for the chart
    const packagedData = statistics.map(admin => admin.packagedCasesCount);
    const deliveredData = statistics.map(admin => admin.deliveredCasesCount);
    const labels = statistics.map(admin => admin.name);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Packaged Cases',
                data: packagedData,
                backgroundColor: 'rgba(27, 59, 111, 0.7)', // Persian Blue
                borderColor: '#1B3B6F', // Solid Persian Blue
                borderWidth: 1,
            },
            {
                label: 'Delivered Cases',
                data: deliveredData,
                backgroundColor: 'rgba(255, 99, 71, 0.7)', // Tomato
                borderColor: '#FF6347', // Solid Tomato
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                precision: 0, // Ensures whole numbers (no decimals)

            },
        },
    };

    return (
        <div className="p-6">
            <motion.h2
                className="text-2xl font-bold mb-4 text-center text-white"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Admin Statistics
            </motion.h2>

            <motion.div
                className="bg-transparent p-8 rounded-xl shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Bar data={data} options={options} />
            </motion.div>
        </div>
    );
};

export default AdminStatistics;
