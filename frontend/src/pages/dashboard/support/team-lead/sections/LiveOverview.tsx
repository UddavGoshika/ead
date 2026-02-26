import React from 'react';
import { Users, Clock, AlertTriangle, MessageSquare, PhoneCall, CheckCircle } from 'lucide-react';
import styles from './SupportSections.module.css';

const LiveOverview: React.FC = () => {
    return (
        <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Real-Time Queue Overview</h2>
                    <p className={styles.sectionSubtitle}>Monitor live incoming tickets, calls, and agent availability.</p>
                </div>
            </div>

            <div className={styles.liveStatsGrid}>
                {/* Active Agents */}
                <div className={styles.liveStatCard}>
                    <div className={styles.statHeader}>
                        <Users size={20} className={styles.iconBlue} />
                        <h4>Active Agents</h4>
                    </div>
                    <div className={styles.statBody}>
                        <span className={styles.largeNumber}>24</span>
                        <span className={styles.subtext}>/ 30 Logged In</span>
                    </div>
                    <div className={styles.progressContainer}>
                        <div className={styles.progressBar} style={{ width: '80%', background: '#3b82f6' }}></div>
                    </div>
                </div>

                {/* Queue Length */}
                <div className={styles.liveStatCard}>
                    <div className={styles.statHeader}>
                        <MessageSquare size={20} className={styles.iconYellow} />
                        <h4>Unassigned Tickets</h4>
                    </div>
                    <div className={styles.statBody}>
                        <span className={styles.largeNumber}>142</span>
                        <span className={styles.subtext}>Awaiting Routing</span>
                    </div>
                    <div className={styles.trendRow}>
                        <span className={styles.trendUp}>+12%</span> vs last hour
                    </div>
                </div>

                {/* Avg Wait Time */}
                <div className={styles.liveStatCard}>
                    <div className={styles.statHeader}>
                        <Clock size={20} className={styles.iconOrange} />
                        <h4>Avg Wait Time</h4>
                    </div>
                    <div className={styles.statBody}>
                        <span className={styles.largeNumber}>4m 12s</span>
                        <span className={styles.subtext}>Live Chats & Calls</span>
                    </div>
                    <div className={styles.trendRow}>
                        <span className={styles.trendDown}>-30s</span> vs yesterday
                    </div>
                </div>

                {/* SLA Breaches */}
                <div className={styles.liveStatCard} style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div className={styles.statHeader}>
                        <AlertTriangle size={20} className={styles.iconRed} />
                        <h4 style={{ color: '#ef4444' }}>SLA Breaches</h4>
                    </div>
                    <div className={styles.statBody}>
                        <span className={styles.largeNumber} style={{ color: '#ef4444' }}>8</span>
                        <span className={styles.subtext}>High Priority Tickets</span>
                    </div>
                    <div className={styles.pulseIndicator}>
                        <div className={styles.pulseRing}></div>
                        Critical Attention Needed
                    </div>
                </div>
            </div>

            <div className={styles.splitLayout}>
                <div className={styles.card} style={{ flex: 2 }}>
                    <div className={styles.cardHeader}>
                        <h3>Live Call Queue Monitoring</h3>
                    </div>
                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Caller</th>
                                    <th>Intent / IVR Choice</th>
                                    <th>Wait Time</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className={styles.highlightCell}>+1 (555) 019-2834</td>
                                    <td>Billing Inquiry</td>
                                    <td style={{ color: '#ef4444', fontWeight: 600 }}>08:45</td>
                                    <td><span className={styles.badgeWarning}>Waiting</span></td>
                                    <td><button className={styles.actionLink}>Force Route</button></td>
                                </tr>
                                <tr>
                                    <td className={styles.highlightCell}>+44 7700 900077</td>
                                    <td>Technical Support</td>
                                    <td style={{ color: '#f59e0b' }}>03:12</td>
                                    <td><span className={styles.badgeWarning}>Waiting</span></td>
                                    <td><button className={styles.actionLink}>Force Route</button></td>
                                </tr>
                                <tr>
                                    <td className={styles.highlightCell}>+1 (555) 332-1199</td>
                                    <td>Sales Escalation</td>
                                    <td>01:05</td>
                                    <td><span className={styles.badgeSuccess}>In Progress</span></td>
                                    <td><button className={styles.actionLink}>Monitor Call</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={styles.card} style={{ flex: 1 }}>
                    <div className={styles.cardHeader}>
                        <h3>Agent Activity Heatmap</h3>
                    </div>
                    <div className={styles.heatmapList}>
                        <div className={styles.agentRow}>
                            <div className={styles.agentInfo}>
                                <div className={styles.avatar}>AS</div>
                                <span>Alice Smith</span>
                            </div>
                            <span className={styles.statusDot} style={{ background: '#10b981' }} title="Available"></span>
                        </div>
                        <div className={styles.agentRow}>
                            <div className={styles.agentInfo}>
                                <div className={styles.avatar}>BJ</div>
                                <span>Bob Jones</span>
                            </div>
                            <span className={styles.statusDot} style={{ background: '#f59e0b' }} title="On Call (12m)"></span>
                        </div>
                        <div className={styles.agentRow}>
                            <div className={styles.agentInfo}>
                                <div className={styles.avatar}>CM</div>
                                <span>Charlie Miller</span>
                            </div>
                            <span className={styles.statusDot} style={{ background: '#ef4444' }} title="Away / Break"></span>
                        </div>
                        <div className={styles.agentRow}>
                            <div className={styles.agentInfo}>
                                <div className={styles.avatar}>DW</div>
                                <span>Diana Wong</span>
                            </div>
                            <span className={styles.statusDot} style={{ background: '#3b82f6' }} title="Chatting (3 active)"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveOverview;
