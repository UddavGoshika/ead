import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Briefcase, AlertOctagon, CheckSquare, Clock } from 'lucide-react';
import { DataTable } from '../../dashboard/shared/DataTable';

interface Task { id: string; title: string; owner: string; progress: number; dueDate: string; }
interface Bottleneck { process: string; delay: string; severity: string; }
interface Completion { weekly_target: number; completed: number; rate: string; }

const WorkflowCommandCenter: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [delayedTasks, setDelayedTasks] = useState<Task[]>([]);
    const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([]);
    const [completion, setCompletion] = useState<Completion | null>(null);

    const fetchData = async () => {
        try {
            const [tRes, dtRes, bRes, cRes] = await Promise.all([
                axios.get('/api/operations/tasks?status=active'),
                axios.get('/api/operations/tasks?status=delayed'),
                axios.get('/api/operations/bottlenecks'),
                axios.get('/api/operations/completion-rate')
            ]);
            setTasks(tRes.data.data);
            setDelayedTasks(dtRes.data.data);
            setBottlenecks(bRes.data.data);
            setCompletion(cRes.data.data);
        } catch (err) {
            console.error("OS Failed to fetch Operations data:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReassign = async (id: string) => {
        const owner = prompt('Enter new Owner name:');
        if (owner) {
            await axios.patch('/api/operations/task/reassign', { taskId: id, newOwner: owner });
            fetchData();
        }
    };

    const handleCloseTask = async (id: string) => {
        if (window.confirm('Mark task as closed?')) {
            await axios.patch('/api/operations/task/close', { taskId: id });
            fetchData();
        }
    };

    if (!completion) return <div style={{ color: '#94a3b8', padding: '20px' }}>Loading Workflow Command Center...</div>;

    return (
        <div style={{ padding: '24px', background: '#0f172a', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <MetricCard title="Active Cross-Org Tasks" value={tasks.length} icon={<Briefcase color="#3b82f6" />} subtitle="On track" />
                <MetricCard title="Delayed Deliverables" value={delayedTasks.length} icon={<Clock color="#f59e0b" />} subtitle="Action required" />
                <MetricCard title="Bottlenecks Identified" value={bottlenecks.length} icon={<AlertOctagon color="#f43f5e" />} subtitle="High impact" />
                <MetricCard title="Process Completion" value={completion.rate} icon={<CheckSquare color="#10b981" />} subtitle={`${completion.completed} / ${completion.weekly_target} Target`} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={18} color="#3b82f6" /> Active Tasks
                    </h3>
                    <DataTable
                        columns={[
                            { header: 'Title', accessor: 'title' as const },
                            { header: 'Owner', accessor: 'owner' as const },
                            {
                                header: 'Progress', accessor: (t: Task) => (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '100px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${t.progress}%`, background: '#3b82f6', height: '6px' }} />
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t.progress}%</span>
                                    </div>
                                )
                            },
                            {
                                header: 'Actions', accessor: (t: Task) => (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleReassign(t.id)} style={{ ...btnStyle, background: '#334155' }}>Reassign</button>
                                        <button onClick={() => handleCloseTask(t.id)} style={{ ...btnStyle, background: '#10b98120', color: '#10b981' }}>Close</button>
                                    </div>
                                )
                            }
                        ]}
                        data={tasks}
                        keyExtractor={(t: Task) => t.id}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                        <h3 style={{ marginBottom: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertOctagon size={18} color="#f43f5e" /> Active Bottlenecks
                        </h3>
                        <DataTable
                            columns={[
                                { header: 'Process', accessor: 'process' as const },
                                { header: 'Delay Duration', accessor: 'delay' as const },
                                { header: 'Severity', accessor: (b: Bottleneck) => <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: b.severity === 'High' ? '#f43f5e20' : '#f59e0b20', color: b.severity === 'High' ? '#f43f5e' : '#f59e0b' }}>{b.severity}</span> }
                            ]}
                            data={bottlenecks}
                            keyExtractor={(b: Bottleneck) => b.process}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, subtitle }: { title: string, value: string | number, icon: React.ReactNode, subtitle: string }) => (
    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>{title}</span>
            {icon}
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc' }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{subtitle}</div>
    </div>
);

const btnStyle = { border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };

export default WorkflowCommandCenter;
