import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { Metric } from '../types';

interface PerformanceChartProps {
    metrics: Metric[];
    detailed?: boolean;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ metrics, detailed = false }) => {
    // Generate data from metrics
    const data = metrics.length > 0 ? metrics.map((m, i) => ({
        name: m.name,
        value: m.value
    })) : [
        { name: 'Mon', value: 78 },
        { name: 'Tue', value: 85 },
        { name: 'Wed', value: 82 },
        { name: 'Thu', value: 94 },
        { name: 'Fri', value: 89 },
        { name: 'Sat', value: 91 },
        { name: 'Sun', value: 89 },
    ];

    const height = detailed ? 350 : 250;
    const color = detailed ? '#8b5cf6' : '#3b82f6';

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#f8fafc'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        strokeWidth={3}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PerformanceChart;
