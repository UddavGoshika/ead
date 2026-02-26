import React, { useState } from 'react';
import { StatCard } from '../../../../components/dashboard/shared/StatCard';
import {
    CheckCircle, Clock, AlertTriangle, Users, ArrowRight, ShieldCheck,
    XCircle, Info, Filter, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VerifierOverview: React.FC = () => {
    const [selectedTask, setSelectedTask] = useState<any>(null);

    const pendingTasks = [
        { id: 'VR-2001', name: 'Rahul Sharma', type: 'Advocate Verification', submitted: '12m ago', sla: 'Critical', slaColor: '#ef4444', priority: 1 },
        { id: 'VR-2002', name: 'Sneha Gupta', type: 'ID Document Check', submitted: '45m ago', sla: 'Near Breach', slaColor: '#f59e0b', priority: 2 },
        { id: 'VR-2003', name: 'Legal Corp Ltd', type: 'Service Provider KYC', submitted: '2h ago', sla: 'On Track', slaColor: '#10b981', priority: 3 },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatCard
                    title="Pending Tasks"
                    value="24"
                    icon={<Clock size={24} />}
                    color="yellow"
                />
                <StatCard
                    title="Verified Today"
                    value="128"
                    icon={<ShieldCheck size={24} />}
                    color="green"
                />
                <StatCard
                    title="SLA Breach Risk"
                    value="5"
                    icon={<AlertTriangle size={24} />}
                    color="red"
                />
                <StatCard
                    title="Team Active"
                    value="8 / 12"
                    icon={<Users size={24} />}
                    color="blue"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#f8fafc' }}>High Priority Queue</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ padding: '6px 12px', background: '#334155', border: 'none', color: '#f8fafc', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Filter size={14} /> Filter
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pendingTasks.map((task) => (
                            <motion.div
                                key={task.id}
                                onClick={() => setSelectedTask(task)}
                                style={{
                                    padding: '16px', background: '#0f172a', borderRadius: '10px', border: '1px solid #334155', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}
                                whileHover={{ scale: 1.01, borderColor: '#3b82f6' }}
                            >
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ padding: '10px', background: '#3b82f620', borderRadius: '8px', color: '#3b82f6' }}>
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>{task.name}</h4>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{task.type}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>• {task.submitted}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                                        background: `${task.slaColor}20`, color: task.slaColor, border: `1px solid ${task.slaColor}40`
                                    }}>
                                        {task.sla}
                                    </span>
                                    <ArrowRight size={18} className="text-gray-600" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 style={{ margin: '0 0 20px 0', color: '#f8fafc' }}>Review Details</h3>
                    <AnimatePresence mode="wait">
                        {selectedTask ? (
                            <motion.div
                                key={selectedTask.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                            >
                                <div style={{ padding: '16px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>CLIENT ID</div>
                                    <div style={{ color: '#f8fafc', fontWeight: 600 }}>CUS-4421-XB</div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px' }}>Verification Documents</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div style={{ height: '80px', background: '#334155', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>ID_FRONT.JPG</div>
                                        <div style={{ height: '80px', background: '#334155', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>ID_BACK.JPG</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                    <button style={{ flex: 1, padding: '12px', background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <XCircle size={18} /> Reject
                                    </button>
                                    <button style={{ flex: 1, padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <CheckCircle size={18} /> Approve
                                    </button>
                                </div>

                                <button style={{ padding: '10px', background: 'transparent', color: '#3b82f6', border: 'none', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    View Full History <Info size={14} />
                                </button>
                            </motion.div>
                        ) : (
                            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                                Select a task from the queue <br /> to begin verification.
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default VerifierOverview;
