import React from 'react';
import SupportDashboardLayout from './SupportDashboardLayout';
import { MessageSquare, Paperclip, Smile, Bell, Repeat, Ban } from 'lucide-react';
import styles from './ChatSupport.module.css';

const ChatSupport: React.FC = () => {
    const chatActions = (
        <>
            <button className={styles.roleActionBtn}><Paperclip size={16} /> FILE</button>
            <button className={styles.roleActionBtn}><MessageSquare size={16} /> CANNED</button>
            <button className={styles.roleActionBtn}><Smile size={16} /> EMOJI</button>
            <button className={styles.roleActionBtn}><Bell size={16} /> NUDGE</button>
            <button className={styles.roleActionBtn}><Repeat size={16} /> TRANSFER</button>
            <button className={styles.roleActionBtn}><Ban size={16} /> CLOSE</button>
        </>
    );

    const chatWidgets = (
        <section style={{ marginBottom: '35px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#3b82f6', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px' }}>
                <MessageSquare size={16} />
                <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1.5px' }}>AUTO-REPLY & SENTIMENT ANALYSIS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '11px', fontWeight: 900, color: '#94a3b8', letterSpacing: '1px' }}>Quick Templates</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {['#greeting', '#legal_esc', '#id_req'].map(tag => (
                            <span key={tag} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px' }}>{tag}</span>
                        ))}
                    </div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '11px', fontWeight: 900, color: '#94a3b8', letterSpacing: '1px' }}>Sentiment Gauge</h4>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden', margin: '10px 0' }}>
                        <div style={{ width: '85%', height: '100%', background: '#10b981' }} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#10b981' }}>POSITIVE (+0.85)</span>
                </div>
            </div>
        </section>
    );

    return (
        <SupportDashboardLayout
            role="chat"
            title="Premium Chat Command"
            actions={chatActions}
            specificWidgets={chatWidgets}
        />
    );
};

export default ChatSupport;
