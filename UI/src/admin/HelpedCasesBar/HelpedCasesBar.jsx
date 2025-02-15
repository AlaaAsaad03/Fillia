// import { motion } from "framer-motion";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
// import { useState, useEffect } from "react";
// import axios from "axios";

// const HelpedCasesBar = () => {
// 	const [casesData, setCasesData] = useState([]); // Renamed salesData to casesData
// 	const [loading, setLoading] = useState(true);
// 	const [error, setError] = useState(null);

// 	useEffect(() => {
// 		const fetchData = async () => {
// 			try {
// 				const response = await axios.get("http://localhost:4000/api/statistics/cases-helped");
// 				const transformedData = response.data.data.map((item) => ({
// 					name: item.user || "Unknown", // Display user name
// 					casesHelped: item.totalCasesHelped, // Count the number of cases helped
// 				}));
// 				setCasesData(transformedData);
// 			} catch (err) {
// 				setError("Failed to fetch data");
// 			} finally {
// 				setLoading(false);
// 			}
// 		};
// 		fetchData();
// 	}, []);

// 	if (loading) return <p className="text-gray-300">Loading...</p>;
// 	if (error) return <p className="text-red-500">{error}</p>;

// 	return (
// 		<motion.div
// 			className="bg-transparent p-8 rounded-xl shadow-lg"
// 			initial={{ opacity: 0, y: 20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			transition={{ delay: 0.3 }}
// 		>
// 			<h2 className="text-3xl font-semibold text-gray-800 text-center mb-14">Top Users Who Helped The Most Cases</h2>

// 			<div style={{ width: "100%", height: 300 }}>
// 				<ResponsiveContainer>
// 					<BarChart data={casesData} barSize={35}>
// 						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
// 						<XAxis dataKey="name" stroke="#FF6347" tick={{ fill: "#FF6347" }} />
// 						<YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
// 						<Tooltip
// 							contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
// 							itemStyle={{ color: "#FF6347" }}
// 						/>
// 						<Bar dataKey="casesHelped" fill="#1C3F95" /> {/* Persian Blue color */}
// 					</BarChart>
// 				</ResponsiveContainer>
// 			</div>
// 		</motion.div>
// 	);
// };

// export default HelpedCasesBar;

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useState, useEffect } from "react";
import axios from "axios";
import './HelpedCasesBar.css';
// Custom Y-Axis Label (Profile Image + Rank)
const CustomYAxisTick = ({ x, y, payload, data }) => {
    const user = data[payload.index];
    if (!user) return null;
	const url = "http://localhost:4000";

    return (
        <g transform={`translate(${x - 50},${y - 35})`}> {/* Adjusted y for better alignment */}
            <image
				href={`${url}/images/`+ user.profileImage}
                width="35"
                height="35"
                style={{
                    borderRadius: "50%",
                    clipPath: "circle()" // Ensuring fully rounded
                }}
                preserveAspectRatio="xMidYMid slice"
            />
            <text
                x={45}
                y={20}
                fill="#9CA3AF"
                fontSize="14"
                fontWeight="bold" // Making rank bold
                textAnchor="middle"
            >
                {payload.value}
            </text>
        </g>
    );
};

// Custom Bar Label (User's Name Inside the Bar)
const CustomBarLabel = (props) => {
    const { x, y, width, height, index, data } = props;
    const user = data[index];

    return (
        <text
            x={x + width / 2}
            y={y + height / 2}
            fill="white"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
        >
            {user?.name}
        </text>
    );
};

const CustomEndLabel = ({ x, y, width, value }) => {
    return (
        <text
            x={x + width + 15} 
            y={y - 35}  
            fill="#FF6347"
            fontSize="10"
            fontWeight="bold"
            textAnchor="start"
        >
            "{value}"
        </text>
    );
};

const HelpedCasesBar = () => {
    const [casesData, setCasesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:4000/api/statistics/cases-helped");
                const transformedData = response.data.data
                    .map((item, index) => ({
                        rank: index + 1,
                        name: item.user || "Unknown",
                        casesHelped: item.totalCasesHelped,
                        profileImage: item.profileImage,
                    }))
                    .slice(0, 10);
                setCasesData(transformedData);
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
            <h2 className="text-3xl font-semibold text-gray-800 text-center mb-14">
                Top Users Who Helped The Most Cases
            </h2>

            <div style={{ width: "100%", height: 400, display: "flex", alignItems: "center", marginTop: 30 }}>
                <ResponsiveContainer width="100%">
                <BarChart
                     layout="vertical"
                     data={casesData}
                     margin={{ left: 5, right: 5 }}
                     barSize={30}
                     barCategoryGap="1%"  // Reduced from 5% to 2%
                     barGap={-2}  
                >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" dataKey="casesHelped" stroke="#FF6347" tick={{ fill: "#FF6347" }} />

                        {/* YAxis with Profile Image and Rank */}
                        <YAxis
                            type="category"
                            dataKey="rank"
                            stroke="#9CA3AF"                        
                            tickLine={false}
                            tick={({ x, y, payload }) => (
                                <CustomYAxisTick x={x} y={y} payload={payload} data={casesData} />
                            )}
                        />

                        <Tooltip
                            contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
                            itemStyle={{ color: "#FF6347" }}
                        />

                        {/* Bars with User Name Inside */}
                        <Bar dataKey="casesHelped" fill="#1C3F95" label={<CustomBarLabel data={casesData} />}>
                            {casesData.map((entry, index) => (
                                <Cell key={index} />
                            ))}
                        </Bar>

                        <Bar dataKey="casesHelped" fill="transparent" label={<CustomEndLabel />} />

                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default HelpedCasesBar;

