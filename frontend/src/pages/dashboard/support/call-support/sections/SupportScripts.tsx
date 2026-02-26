import React, { useState } from 'react';
import { Search, Book, ChevronRight, MessageSquare, Shield, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const scripts = [
    {
        category: 'Verification',
        items: [
            { title: 'Identity Proof Issues', description: 'Steps to take when ID proof is blurry or invalid.' },
            { title: 'Address Verification', description: 'How to verify address when documents are from different states.' }
        ]
    },
    {
        category: 'Billing & Payments',
        items: [
            { title: 'Refund Eligibility', description: 'Standard response for refund requests.' },
            { title: 'Payment Failure', description: 'Troubleshooting steps for UPI/Card failures.' }
        ]
    },
    {
        category: 'Technical Support',
        items: [
            { title: 'Login Problems', description: 'Handling OTP and password reset issues.' },
            { title: 'App Performance', description: 'What to ask when a client reports slow app.' }
        ]
    }
];

const SupportScripts: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Support Scripts & Playbooks</h2>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text"
                        placeholder="Search scripts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '10px 10px 10px 40px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                {scripts.map((cat, i) => (
                    <motion.div
                        key={i}
                        style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div style={{ padding: '16px 20px', background: '#33415540', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {cat.category === 'Verification' ? <Shield size={18} className="text-blue-400" /> : cat.category === 'Billing & Payments' ? <HelpCircle size={18} className="text-green-400" /> : <MessageSquare size={18} className="text-yellow-400" />}
                            <h4 style={{ margin: 0, color: '#f8fafc' }}>{cat.category}</h4>
                        </div>
                        <div style={{ padding: '12px' }}>
                            {cat.items.map((item, j) => (
                                <button
                                    key={j}
                                    style={{ width: '100%', padding: '12px', background: 'transparent', border: 'none', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', color: '#64748b' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#0f172a'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div>
                                        <div style={{ color: '#f8fafc', fontWeight: 500, fontSize: '0.95rem' }}>{item.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{item.description}</div>
                                    </div>
                                    <ChevronRight size={16} />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SupportScripts;
