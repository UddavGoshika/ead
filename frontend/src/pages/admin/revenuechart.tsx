import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import styles from "./revenue.module.css";

const data = [
    { month: "Jan", revenue: 4200 },
    { month: "Feb", revenue: 3800 },
    { month: "Mar", revenue: 5100 },
    { month: "Apr", revenue: 4700 },
    { month: "May", revenue: 6200 },
    { month: "Jun", revenue: 5800 },
    { month: "Jul", revenue: 6900 },
    { month: "Aug", revenue: 6400 },
    { month: "Sep", revenue: 7200 },
    { month: "Oct", revenue: 7600 },
    { month: "Nov", revenue: 8100 },
    { month: "Dec", revenue: 9000 },
];

const RevenueChart = () => {
    return (
        <div className={styles.graphCard}>
            <h2>Revenue (Last 12 Months)</h2>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#020617" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                        <XAxis dataKey="month" stroke="#cbd5f5" />
                        <YAxis stroke="#cbd5f5" />
                        <Tooltip
                            contentStyle={{
                                background: "#020617",
                                border: "1px solid rgba(148,163,184,0.3)",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                            formatter={(value) => {
                                if (value === undefined) return ["$0", "Revenue"];
                                return [`$${value}`, "Revenue"];
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="url(#revenueGradient)"
                            dot={{ r: 4, fill: "#3b82f6" }}
                            activeDot={{ r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;
