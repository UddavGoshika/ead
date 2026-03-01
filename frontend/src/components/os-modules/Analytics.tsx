import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Analytics: React.FC = () => {
    const [callData, setCallData] = useState<any>(null);
    const [ticketData, setTicketData] = useState<any>(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [callRes, ticketRes] = await Promise.all([
                axios.get('/api/os/analytics/call-volume'),
                axios.get('/api/os/analytics/ticket-resolution')
            ]);
            if (callRes.data.success) setCallData(callRes.data.chartData);
            if (ticketRes.data.success) setTicketData(ticketRes.data.chartData);
        } catch (err) {
            console.error(err);
        }
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: '#f8fafc' }
            },
        },
        scales: {
            y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
            x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
        }
    };

    return (
        <div style={{ padding: '20px', display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Call Volume (7 Days)</h3>
                {callData ? <Line options={options} data={callData} /> : <p style={{ color: '#64748b' }}>Loading...</p>}
            </div>

            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Ticket Resolution Rate</h3>
                {ticketData ? <Line options={options} data={ticketData} /> : <p style={{ color: '#64748b' }}>Loading...</p>}
            </div>
        </div>
    );
};

export default Analytics;
