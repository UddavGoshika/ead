import React, { useState } from 'react';
import { User, PhoneOff, PhoneForwarded, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LeadCalling: React.FC = () => {
    const [callStatus, setCallStatus] = useState<'Idle' | 'Calling' | 'Connected'>('Idle');

    const handleCall = () => {
        setCallStatus('Calling');
        setTimeout(() => setCallStatus('Connected'), 2000);
    };

    const handleEndCall = () => {
        setCallStatus('Idle');
    };

    return (
        <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 120px)' }}>

            {/* Left Panel: Lead Info & Dialer */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div>
                            <span style={{ fontSize: '0.8rem', color: '#3b82f6', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Current Lead</span>
                            <h2 style={{ margin: '4px 0 8px 0', color: '#f8fafc', fontSize: '1.5rem' }}>Anil Kumar</h2>
                            <p style={{ margin: 0, color: '#94a3b8' }}>Marketing Campaign: Diwali Special 2024</p>
                        </div>
                        <div style={{ background: '#10b98120', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
                            Hot Lead
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                            <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '0.8rem' }}>Phone Number</p>
                            <p style={{ margin: 0, color: '#f8fafc', fontWeight: 500 }}>+91 98765 12345</p>
                        </div>
                        <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                            <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '0.8rem' }}>Location</p>
                            <p style={{ margin: 0, color: '#f8fafc', fontWeight: 500 }}>Mumbai, Maharashtra</p>
                        </div>
                    </div>

                    {/* Dialer Controls */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', padding: '24px 0', borderTop: '1px solid #334155' }}>
                        {callStatus === 'Idle' ? (
                            <button
                                onClick={handleCall}
                                style={{
                                    width: '64px', height: '64px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                                    background: '#10b981', color: '#ffffff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                    boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)'
                                }}
                            >
                                <PhoneForwarded size={28} />
                            </button>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                <div style={{ color: callStatus === 'Connected' ? '#10b981' : '#facc15', fontWeight: 600, animation: callStatus === 'Calling' ? 'pulse 1.5s infinite' : 'none' }}>
                                    {callStatus === 'Calling' ? 'Dialing...' : 'Connected (00:14)'}
                                </div>
                                <button
                                    onClick={handleEndCall}
                                    style={{
                                        width: '64px', height: '64px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                                        background: '#ef4444', color: '#ffffff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                        boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)'
                                    }}
                                >
                                    <PhoneOff size={28} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Next Leads Queue */}
                <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', flex: 1 }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc' }}>Up Next in Queue</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { name: 'Sunil Gupta', priority: 'High', time: 'Overdue' },
                            { name: 'Megha Desai', priority: 'Medium', time: '10:30 AM' },
                            { name: 'Rajesh Khanna', priority: 'Low', time: '11:00 AM' },
                        ].map((lead, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '12px', border: '1px solid #334155', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <div style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 500 }}>{lead.name}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{lead.priority} Priority</div>
                                    </div>
                                </div>
                                <span style={{ color: lead.time === 'Overdue' ? '#ef4444' : '#94a3b8', fontSize: '0.8rem' }}>{lead.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel: Call Disposition */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 24px 0', color: '#f8fafc' }}>Call Disposition</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                        <button style={{ background: '#10b98120', border: '1px solid #10b981', color: '#10b981', padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle size={20} />
                            <span style={{ fontWeight: 600 }}>Converted</span>
                        </button>
                        <button style={{ background: '#3b82f620', border: '1px solid #3b82f6', color: '#3b82f6', padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <PhoneForwarded size={20} />
                            <span style={{ fontWeight: 600 }}>Call Back Later</span>
                        </button>
                        <button style={{ background: '#facc1520', border: '1px solid #facc15', color: '#facc15', padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <PhoneOff size={20} />
                            <span style={{ fontWeight: 600 }}>No Answer</span>
                        </button>
                        <button style={{ background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <XCircle size={20} />
                            <span style={{ fontWeight: 600 }}>Not Interested</span>
                        </button>
                    </div>

                    <h4 style={{ color: '#f8fafc', margin: '0 0 12px 0' }}>Call Notes</h4>
                    <textarea
                        placeholder="Log details of the conversation..."
                        style={{
                            flex: 1, width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #334155',
                            background: '#0f172a', color: '#f8fafc', resize: 'none'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <button style={{ background: '#3b82f6', border: 'none', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                            Save & Next Lead
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadCalling;
