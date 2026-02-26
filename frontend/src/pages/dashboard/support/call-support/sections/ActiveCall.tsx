import React from 'react';
import { Phone, PhoneOff, Mic, MicOff, User, Clock, AlertCircle, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const ActiveCall: React.FC = () => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', height: '100%' }}>
            {/* Left Console */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <motion.div
                    style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '32px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#3b82f620', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <User size={32} className="text-blue-400" />
                    </div>
                    <h2 style={{ color: '#fff', margin: '0 0 8px 0' }}>Sunil Tandan</h2>
                    <p style={{ color: '#94a3b8', margin: '0 0 24px 0' }}>ID: ADV-9921 | Client: Platinum</p>

                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f8fafc', fontVariantNumeric: 'tabular-nums', marginBottom: '32px' }}>
                        04:12
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                        <button style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#334155', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MicOff size={24} />
                        </button>
                        <button style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px #ef444440' }}>
                            <PhoneOff size={28} />
                        </button>
                        <button style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#334155', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Phone size={24} />
                        </button>
                    </div>
                </motion.div>

                <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '1rem' }}>Active Call Notes</h3>
                    <textarea
                        placeholder="Type call notes here..."
                        style={{ width: '100%', padding: '16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', resize: 'none' }}
                        rows={6}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                        <button style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600 }}>Save & Attach to Case</button>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Call Queue */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '0.95rem' }}>Call Queue</h3>
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#3b82f620', color: '#3b82f6', borderRadius: '12px', fontWeight: 600 }}>4 Waiting</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { name: 'Amit Shah', wait: '3m 12s', priority: 'VIP', color: '#f59e0b' },
                            { name: 'Neha Gupta', wait: '2m 45s', priority: 'Standard', color: '#3b82f6' },
                            { name: 'Unknown', wait: '1m 20s', priority: 'Standard', color: '#94a3b8' },
                            { name: 'Rahul V.', wait: '0m 45s', priority: 'VIP', color: '#f59e0b' }
                        ].map((call, i) => (
                            <div key={i} style={{ padding: '12px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ color: '#f8fafc', fontWeight: 500, fontSize: '0.85rem' }}>{call.name}</span>
                                    <span style={{ color: call.color, fontSize: '0.7rem', fontWeight: 700 }}>{call.priority}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.75rem' }}>
                                    <Clock size={12} />
                                    <span>{call.wait}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '0.95rem' }}>Your Stats (Today)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ padding: '12px', background: '#0f172a', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>24</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Calls Handled</div>
                        </div>
                        <div style={{ padding: '12px', background: '#0f172a', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>4.8</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>CSAT Score</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveCall;
