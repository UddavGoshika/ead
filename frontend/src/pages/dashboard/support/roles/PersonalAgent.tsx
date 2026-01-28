import React from 'react';
import SupportDashboardLayout from './SupportDashboardLayout';
import { UserPlus, Repeat, PhoneCall, MessageSquare, UserCheck, Calendar } from 'lucide-react';
import styles from './PersonalAgent.module.css';

const PersonalAgent: React.FC = () => {
    const assistantActions = (
        <>
            <button className={styles.roleActionBtn}><UserPlus size={16} /> ASSIGN</button>
            <button className={styles.roleActionBtn}><Repeat size={16} /> CHANGE</button>
            <button className={styles.roleActionBtn}><PhoneCall size={16} /> ASST CALL</button>
            <button className={styles.roleActionBtn}><MessageSquare size={16} /> ASST CHAT</button>
            <button className={styles.roleActionBtn}><UserCheck size={16} /> DELEGATE</button>
        </>
    );

    const assistantWidgets = (
        <section style={{ marginBottom: '35px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f59e0b', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px' }}>
                <Calendar size={16} />
                <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1.5px' }}>VIP SCHEDULER & REVENUE TRACKING</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '11px', fontWeight: 900, color: '#94a3b8', letterSpacing: '1px' }}>VIP Revenue</h4>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#f59e0b' }}>₹12,450.00 <span style={{ fontSize: '10px', color: '#64748b' }}>MONTHLY</span></div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '11px', fontWeight: 900, color: '#94a3b8', letterSpacing: '1px' }}>Pending Tasks</h4>
                    <div style={{ fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>- File review required</div>
                        <div>- Schedule high court uplink</div>
                    </div>
                </div>
            </div>
        </section>
    );

    return (
        <SupportDashboardLayout
            role="assistant"
            title="VIP Elite Assistant"
            actions={assistantActions}
            specificWidgets={assistantWidgets}
        />
    );
};

export default PersonalAgent;
