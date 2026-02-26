import React, { useState } from 'react';
import { Calendar, Users, Clock, Plus, MoreHorizontal, User } from 'lucide-react';
import { motion } from 'framer-motion';

const ResourcePlanning: React.FC = () => {
    const shifts = ['Morning (09:00 - 17:00)', 'Evening (13:00 - 21:00)', 'Night (21:00 - 05:00)'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    const [roster, setRoster] = useState([
        { id: 1, name: 'Rahul S.', role: 'Telecaller', shift: 0 },
        { id: 2, name: 'Sneha G.', role: 'Customer Care', shift: 1 },
        { id: 3, name: 'Arjun V.', role: 'Telecaller', shift: 0 },
        { id: 4, name: 'Priya D.', role: 'Data Entry', shift: 2 },
    ]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Resource & Shift Planning</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                        Auto-Generate Roster
                    </button>
                    <button style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> Add Staff
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>Staff Capacity</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc' }}>92%</div>
                    <div style={{ height: '4px', background: '#0f172a', borderRadius: '2px', marginTop: '12px' }}>
                        <div style={{ width: '92%', height: '100%', background: '#10b981', borderRadius: '2px' }} />
                    </div>
                </div>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>Active Shifts</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc' }}>3</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Across all operations</div>
                </div>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>Peak Load Expected</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#3b82f6' }}>14:00</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Based on ticket volume</div>
                </div>
            </div>

            <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ margin: '0 0 24px 0', color: '#f8fafc' }}>Scheduling Matrix</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ color: '#64748b', borderBottom: '1px solid #334155' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>STAFF MEMBER</th>
                                {shifts.map((s, i) => (
                                    <th key={i} style={{ padding: '12px', textAlign: 'center' }}>{s}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {roster.map((staff) => (
                                <tr key={staff.id} style={{ borderBottom: '1px solid #334155' }}>
                                    <td style={{ padding: '16px 12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={16} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <div style={{ color: '#f8fafc', fontWeight: 600 }}>{staff.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{staff.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    {shifts.map((_, i) => (
                                        <td key={i} style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            <div
                                                style={{
                                                    width: '100%', height: '40px', background: staff.shift === i ? '#3b82f620' : 'transparent',
                                                    border: staff.shift === i ? '1px dashed #3b82f6' : '1px solid #33415520',
                                                    borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                                onClick={() => {
                                                    const newRoster = roster.map(r => r.id === staff.id ? { ...r, shift: i } : r);
                                                    setRoster(newRoster);
                                                }}
                                            >
                                                {staff.shift === i && <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%' }} />}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ResourcePlanning;
