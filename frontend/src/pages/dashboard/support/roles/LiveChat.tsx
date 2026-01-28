import React from 'react';
import SupportDashboardLayout from './SupportDashboardLayout';
import { Bot, Share2, UserPlus, Eye, Globe } from 'lucide-react';
import styles from './LiveChat.module.css';

const LiveChat: React.FC = () => {
    const liveActions = (
        <>
            <button className={styles.roleActionBtn}><Bot size={16} /> BOT</button>
            <button className={styles.roleActionBtn}><Share2 size={16} /> AUTO-RT</button>
            <button className={styles.roleActionBtn}><UserPlus size={16} /> JOIN</button>
            <button className={styles.roleActionBtn}><Eye size={16} /> MONITOR</button>
            <button className={styles.roleActionBtn}><Globe size={16} /> BROADCAST</button>
        </>
    );

    const liveWidgets = (
        <section style={{ marginBottom: '35px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#8b5cf6', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px' }}>
                <Globe size={16} />
                <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1.5px' }}>VISITOR GEOSPATIAL MONITOR & ACTIVITY</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '11px', fontWeight: 900, color: '#94a3b8', letterSpacing: '1px' }}>Active Signals</h4>
                    <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>Maharashtra: 12</div>
                        <div>Delhi NCR: 8</div>
                    </div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '11px', fontWeight: 900, color: '#94a3b8', letterSpacing: '1px' }}>Traffic Density</h4>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden', margin: '10px 0' }}>
                        <div style={{ width: '65%', height: '100%', background: '#8b5cf6' }} />
                    </div>
                </div>
            </div>
        </section>
    );

    return (
        <SupportDashboardLayout
            role="live"
            title="Quantum Live Ops"
            actions={liveActions}
            specificWidgets={liveWidgets}
        />
    );
};

export default LiveChat;
