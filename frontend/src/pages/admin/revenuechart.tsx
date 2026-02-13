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

// Hardcoded fallback removed
interface ChartData {
    month: string;
    revenue: number;
}

interface Props {
    data?: ChartData[];
}

const RevenueChart: React.FC<Props> = ({ data = [] }) => {
    return (
        <div className={styles.graphCard}>
            <h2>Revenue (Current Year)</h2>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data && data.length > 0 ? data : []}>
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
                                if (value === undefined) return ["₹0", "Revenue"];
                                return [`₹${value}`, "Revenue"];
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
