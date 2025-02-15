import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { DollarSign, Users, Clipboard, ClipboardCheck, ArrowUpRight, ArrowDownRight  } from "lucide-react";
import axios from "axios";

const StatCards = () => {
    const [overviewData, setOverviewData] = useState([]);
    const [todayCaseCount, setTodayCaseCount] = useState(0);
    const [totalHelpedCases, setTotalHelpedCases] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, revenueRes, ordersRes, helpedCasesRes] = await Promise.all([
                    axios.get("http://localhost:4000/api/statistics/registered-users"),
                    axios.get("http://localhost:4000/api/statistics/total-revenue"),
                    axios.get("http://localhost:4000/api/statistics/daily-case-creation"),
                    axios.get("http://localhost:4000/api/statistics/cases/helped/count"),
                ]);

                // Extracting today's case count
                const today = new Date().toISOString().split('T')[0];
                const todayData = ordersRes.data.data.find(item => item._id === today);
                const todayCaseCount = todayData ? todayData.count : 0;

                // Users data
                const totalUsers = usersRes.data.count;
                const usersLastMonth = usersRes.data.lastMonthCount || 0;
                const userChange = ((totalUsers - usersLastMonth) / (usersLastMonth || 1) * 100).toFixed(1);

                // Revenue data
                const totalRevenue = revenueRes.data.totalAmount;
                const yesterdayRevenue = revenueRes.data.yesterdayTotal || 0;
                const revenueDifference = revenueRes.data.difference;
                const revenueChange = ((revenueDifference / (yesterdayRevenue || 1)) * 100).toFixed(1);

                // Helped cases
                const totalHelpedCases = helpedCasesRes.data.totalCases;

                // Map data to cards
                const data = [
                    {
                        name: "Total Donations",
                        // value: `$${totalRevenue.toLocaleString()}`,
                        value: "600",
                        change: revenueChange,
                        icon: DollarSign,
                        changePositive: revenueDifference >= 0,
                    },
                    {
                        name: "Users",
                        value: totalUsers.toLocaleString(),
                        change: "0",
                        icon: Users,
                        changePositive: true,
                    },
                    {
                        name: "Today's Cases",
                        value: todayCaseCount.toLocaleString(),
                        change: "0", // No percentage change provided for daily cases
                        icon: Clipboard,
                        changePositive: false,
                    },
                    {
                        name: "Total Helped Cases",
                        value: totalHelpedCases.toLocaleString(),
                        change: "0", // No percentage change for total helped cases
                        icon: ClipboardCheck,
                        changePositive: true,
                    },
                ];

                setOverviewData(data);
            } catch (err) {
                setError("Failed to fetch data from the backend.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="flex justify-start gap-6 p-6">
            {overviewData.map((item, index) => (
                <motion.div
                    key={item.name}
                    className="bg-gradient-to-r from-[#1E3A5F] to-[#FF6F00] p-8 rounded-xl shadow-lg w-1/4 transform transition-all duration-500 ease-in-out 
                    hover:scale-105 hover:shadow-2xl backdrop-blur-sm"
                    style={{ minHeight: '220px' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                            <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
                        </div>
                        <div className="p-4 rounded-full bg-[#2C3E50] hover:bg-[#1E2D3A] transition duration-300">
                            <item.icon size={32} className="text-white" />
                        </div>
                    </div>

                    <div className={`mt-4 flex items-center ${item.changePositive ? "text-green-400" : "text-red-400"}`}>
                        {item.change !== "0" && (
                        item.changePositive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />
                        )}
                        <span className="ml-2 text-lg font-medium">{item.change !== "0" ? Math.abs(item.change) : ""}</span>
                    </div>

                
                </motion.div>
            ))}
        </div>
    );
}

export default StatCards;
