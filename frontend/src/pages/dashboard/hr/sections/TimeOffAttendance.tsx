import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Check, X, Filter, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const TimeOffAttendance: React.FC = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

    const pendingLeave = [
        { id: 'PTO-11', employee: 'Rahul Sharma', type: 'Sick Leave', range: 'Oct 26 - Oct 27', reason: 'Flu symptoms' },
        { id: 'PTO-12', employee: 'Sneha Gupta', type: 'Annual Leave', range: 'Nov 02 - Nov 05', reason: 'Family vacation' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Attendance & PTO</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={16} /> Filter Attendance
                    </button>
                    <button style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                        Policy Settings
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h3 style={{ margin: 0, color: '#f8fafc' }}>Team Calendar</h3>
                            <span style={{ color: '#64748b' }}>October 2024</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ padding: '6px', background: '#334155', border: 'none', borderRadius: '6px', color: '#fff' }}><ChevronLeft size={16} /></button>
                            <button style={{ padding: '6px', background: '#334155', border: 'none', borderRadius: '6px', color: '#fff' }}><ChevronRight size={16} /></button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#334155' }}>
                        {days.map(d => (
                            <div key={d} style={{ background: '#1e293b', padding: '12px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{d}</div>
                        ))}
                        {calendarDays.map(d => {
                            const isLeave = [12, 13, 14, 26, 27].includes(d);
                            return (
                                <div key={d} style={{ background: '#1e293b', height: '80px', padding: '8px', position: 'relative' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{d}</span>
                                    {isLeave && (
                                        <div style={{
                                            position: 'absolute', bottom: '8px', left: '4px', right: '4px', padding: '4px 6px',
                                            background: d >= 26 ? '#ef444420' : '#3b82f620', borderLeft: `3px solid ${d >= 26 ? '#ef4444' : '#3b82f6'}`,
                                            fontSize: '0.65rem', color: d >= 26 ? '#ef4444' : '#3b82f6', borderRadius: '2px'
                                        }}>
                                            {d >= 26 ? 'Rahul S. (Sick)' : 'Sneha G. (Vac)'}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <motion.div
                        style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 style={{ margin: '0 0 20px 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={20} className="text-yellow-500" /> Pending Requests
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {pendingLeave.map((req) => (
                                <div key={req.id} style={{ padding: '16px', background: '#0f172a', borderRadius: '10px', border: '1px solid #334155' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{req.employee}</div>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.id}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px' }}>
                                        {req.type} • {req.range}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button style={{ flex: 1, padding: '8px', background: '#10b98120', color: '#10b981', border: '1px solid #10b98140', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                                        <button style={{ flex: 1, padding: '8px', background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div style={{ background: '#3b82f610', padding: '20px', borderRadius: '12px', border: '1px solid #3b82f630' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#3b82f6' }}>Employee Coverage Alert</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                            Support Team will have <span style={{ color: '#fff' }}>25% reduced capacity</span> on Nov 2nd due to overlapping leave requests.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeOffAttendance;
