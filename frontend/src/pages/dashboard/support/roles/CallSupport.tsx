import React from 'react';
import SupportDashboardLayout from './SupportDashboardLayout';
import { Mic, Pause, Repeat, PhoneCall, Receipt, BellOff, Activity, Clock } from 'lucide-react';
import styles from './CallSupport.module.css';

const CallSupport: React.FC = () => {
    const callActions = (
        <>
            <button className={styles.roleActionBtn}><Mic size={16} /> RECORD</button>
            <button className={styles.roleActionBtn}><Pause size={16} /> HOLD</button>
            <button className={styles.roleActionBtn}><Repeat size={16} /> TRANSFER</button>
            <button className={styles.roleActionBtn}><PhoneCall size={16} /> CALL BACK</button>
            <button className={styles.roleActionBtn}><Receipt size={16} /> SUMMARY</button>
            <button className={styles.roleActionBtn}><BellOff size={16} /> MUTE</button>
        </>
    );

    const callWidgets = (
        <section style={{ marginBottom: '35px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px' }}>
                <Activity size={16} />
                <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1.5px' }}>CALL RECORDING HUB & PROMPTS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '11px', fontWeight: 900, color: '#94a3b8', letterSpacing: '1px' }}>Live Recording</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px' }}>Auto-Record Uplink</span>
                        <div style={{ width: '30px', height: '16px', background: '#334155', borderRadius: '100px', position: 'relative' }}>
                            <div style={{ width: '12px', height: '12px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px' }} />
                        </div>
                    </div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '11px', fontWeight: 900, color: '#94a3b8', letterSpacing: '1px' }}>Recording History</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}><Clock size={10} /> Session_082.mp3 <span>2m 45s</span></div>
                        <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}><Clock size={10} /> Session_079.mp3 <span>5m 12s</span></div>
                    </div>
                </div>
            </div>
        </section>
    );

    return (
        <SupportDashboardLayout
            role="call"
            title="Premium Call Command"
            actions={callActions}
            specificWidgets={callWidgets}
        />
    );
};

export default CallSupport;
