import React from 'react';
import {
    Clock, Tag, User, FileText, Send,
    MessageSquare, History, CheckCircle, XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface WorkItemDetailProps {
    item: any;
    onClose: () => void;
    role: 'telecaller' | 'customer_care' | 'data_entry';
}

const WorkItemDetail: React.FC<WorkItemDetailProps> = ({ item, onClose, role }) => {
    if (!item) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
                height: '100%', display: 'flex', flexDirection: 'column', gap: '24px',
                background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>{item.id}</span>
                    <h2 style={{ margin: '4px 0 0 0', color: '#f8fafc' }}>{item.title || 'Work Item Review'}</h2>
                </div>
                <div style={{ padding: '4px 12px', background: '#3b82f620', color: '#3b82f6', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {item.priority} Priority
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '12px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>ASSIGNED TO</div>
                    <div style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 500 }}>{item.assignedTo || 'Unassigned'}</div>
                </div>
                <div style={{ padding: '12px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>QUEUE TIME</div>
                    <div style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 500 }}>{item.queueTime || '2h 14m'}</div>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} /> Item Metadata
                    </h4>
                    <div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px' }}>
                        <pre style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(item.metadata || { "source": "Web Form", "category": "Urgent", "region": "North" }, null, 2)}
                        </pre>
                    </div>
                </div>

                <div>
                    <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <History size={16} /> Activity History
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { time: '10:30 AM', action: 'Item Created', user: 'System' },
                            { time: '11:15 AM', action: 'Assigned to Agent', user: 'Admin' },
                        ].map((log, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                                <span style={{ color: '#64748b', minWidth: '70px' }}>{log.time}</span>
                                <span style={{ color: '#f8fafc' }}>{log.action}</span>
                                <span style={{ color: '#3b82f6' }}>by {log.user}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #334155', paddingTop: '20px' }}>
                <textarea
                    placeholder="Add internal notes or processing status..."
                    style={{ width: '100%', height: '80px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '0.9rem', resize: 'none' }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{ flex: 1, padding: '12px', background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <XCircle size={18} /> Escalate
                    </button>
                    <button
                        style={{ flex: 1, padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <CheckCircle size={18} /> Mark Complete
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default WorkItemDetail;
