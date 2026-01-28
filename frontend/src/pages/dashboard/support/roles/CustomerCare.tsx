import React, { useState } from "react";
import styles from "./SupportRoles.module.css";
import SupportSidebar from "./SupportSidebar";
import SystemAlerts from "./SystemAlerts";
import type { User } from "./SupportSidebar";
import {
    HeartHandshake, Shield,
    FileSearch, Box,
    Clock, AlertCircle, Share2, Zap,
    Database, Map, Layout, UserPlus
} from "lucide-react";

const CustomerCare: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [timeLeft, setTimeLeft] = useState(1439); // Seconds for SLA

    React.useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatSLA = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };
    return (
        <div className={styles.hubWrapper}>
            <SupportSidebar
                onUserSelect={(u) => setSelectedUser(u)}
                activeUserId={selectedUser?.id}
            />

            <main className={styles.mainContent}>
                {selectedUser ? (
                    <div className={styles.caseView}>
                        <header className={styles.caseHeader}>
                            <div className={styles.headerTitle}>
                                <div className={styles.monitorCard} style={{ display: "inline-flex", padding: "8px 16px", marginBottom: "16px", borderColor: "var(--quantum-violet)" }}>
                                    <span style={{ fontSize: "11px", fontWeight: 950, color: "var(--quantum-violet)", letterSpacing: "1px" }}>CASE IDENTIFIER: #QCAT-{selectedUser.id}</span>
                                </div>
                                <h1 style={{ fontSize: "42px", fontWeight: 950, letterSpacing: "-2px" }}>{selectedUser.name}</h1>
                                <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
                                    <p style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                                        <Shield size={16} color="var(--quantum-cyan)" /> Priority Alpha-1
                                    </p>
                                    <p style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0, color: "#ef4444" }}>
                                        <Clock size={16} /> SLA BREACH IN: {formatSLA(timeLeft)}
                                    </p>
                                </div>
                            </div>
                            <div className={styles.controls}>
                                <button className={styles.controlBtn}><Share2 size={16} /> Internal Share</button>
                                <button className={`${styles.controlBtn} ${styles.primaryAction}`}>
                                    <Zap size={16} /> Fast-Track Action
                                </button>
                            </div>
                        </header>

                        <div className={styles.dossierSection}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                                <h3 style={{ margin: 0, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <FileSearch size={18} color="var(--quantum-cyan)" /> Quantum User Intelligence
                                </h3>
                                <div style={{ background: "rgba(0, 242, 255, 0.1)", padding: "6px 14px", borderRadius: "100px", fontSize: "11px", fontWeight: 900, color: "var(--quantum-cyan)", border: "1px solid rgba(0, 242, 255, 0.2)" }}>
                                    TRUST INDEX: 98.4
                                </div>
                            </div>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem} style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "16px", border: "1px solid var(--quantum-border)" }}>
                                    <label>Network Seniority</label>
                                    <span style={{ fontSize: "20px", fontWeight: 900 }}>884 Cycles</span>
                                </div>
                                <div className={styles.infoItem} style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "16px", border: "1px solid var(--quantum-border)" }}>
                                    <label>Interaction Sentiment</label>
                                    <span style={{ fontSize: "20px", fontWeight: 900, color: "#10b981" }}>EXCEPTIONAL</span>
                                </div>
                                <div className={styles.infoItem} style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "16px", border: "1px solid var(--quantum-border)" }}>
                                    <label>Response Matrix</label>
                                    <span style={{ fontSize: "20px", fontWeight: 900 }}>ALPHA DIRECT</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "30px" }}>
                            <div className={styles.monitorCard}>
                                <div className={styles.scanning} style={{ height: "1px", opacity: 0.2 }} />
                                <h3>Strategic Resolution Pipeline</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
                                    {[
                                        { s: "Case Initialized", d: "Neural link established with case id #821", t: "09:22", active: false },
                                        { s: "Document Triage", d: "Quantum verification of id-proof complete", t: "10:15", active: false },
                                        { s: "Protocol Escalation", d: "Moved to Senior Advocate Hub for review", t: "11:45", active: true }
                                    ].map((step, i) => (
                                        <div key={i} style={{ display: "flex", gap: "20px", padding: "16px", background: step.active ? "rgba(59, 130, 246, 0.1)" : "rgba(255,255,255,0.01)", borderRadius: "16px", border: step.active ? "1px solid var(--quantum-blue)" : "1px solid transparent" }}>
                                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: step.active ? "var(--quantum-cyan)" : "#1e293b", border: "2px solid #0f172a", flexShrink: 0, boxShadow: step.active ? "0 0 10px var(--quantum-cyan)" : "none" }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                    <span style={{ fontSize: "14px", fontWeight: 900, color: step.active ? "var(--quantum-cyan)" : "#fff" }}>{step.s}</span>
                                                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>{step.t}</span>
                                                </div>
                                                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>{step.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.monitorCard}>
                                <h3>Interaction Heatmap</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", background: "rgba(0,0,0,0.2)", padding: "15px", borderRadius: "12px" }}>
                                    {[...Array(28)].map((_, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                height: "15px",
                                                background: Math.random() > 0.6 ? "var(--quantum-cyan)" : "rgba(255,255,255,0.05)",
                                                borderRadius: "2px",
                                                opacity: Math.random() * 0.8 + 0.2
                                            }}
                                        />
                                    ))}
                                </div>
                                <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <div className={styles.chip} style={{ width: "100%", justifyContent: "space-between" }}>
                                        <span><Database size={12} /> Data Retention</span>
                                        <span>90 Days</span>
                                    </div>
                                    <div className={styles.chip} style={{ width: "100%", justifyContent: "space-between" }}>
                                        <span><Map size={12} /> Geo Node</span>
                                        <span>EU-WEST-4</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.monitorCard} style={{ gridColumn: "span 2" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h3>Escalation & Resolution Path</h3>
                                    <Layout size={16} color="var(--quantum-cyan)" />
                                </div>
                                <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                                    <button className={styles.controlBtn} style={{ flex: 1, flexDirection: "column", height: "100px", gap: "10px" }}>
                                        <UserPlus size={24} />
                                        <span>Add Collaborator</span>
                                    </button>
                                    <button className={styles.controlBtn} style={{ flex: 1, flexDirection: "column", height: "100px", gap: "10px" }}>
                                        <AlertCircle size={24} color="#ef4444" />
                                        <span>Report Incident</span>
                                    </button>
                                    <button className={`${styles.controlBtn} ${styles.primaryAction}`} style={{ flex: 1, flexDirection: "column", height: "100px", gap: "10px" }}>
                                        <HeartHandshake size={24} />
                                        <span>Finalize Resolution</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "24px" }}>
                        <div className={styles.avatar} style={{ width: "100px", height: "100px", background: "rgba(255,255,255,0.03)", fontSize: "40px", border: "1px solid var(--quantum-border)" }}>
                            <Box size={40} color="var(--quantum-violet)" className={styles.pulse} />
                        </div>
                        <h2 style={{ margin: 0, fontWeight: 950, fontSize: "32px", letterSpacing: "-1px" }}>Customer Care Dossier</h2>
                        <p style={{ color: "#64748b", fontWeight: 600 }}>Access high-value case intelligence by selecting a participant signal.</p>
                    </div>
                )}
            </main>

            {/* INTERACTION HISTORY TABLE */}
            <div style={{ padding: "0 50px 50px 50px" }}>
                <div className={styles.tableContainer} style={{ marginTop: 0 }}>
                    <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--luxury-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 900, color: "var(--luxury-text-muted)" }}>REGIONAL CASE RESOLUTION LOGS</h3>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--luxury-gold)" }}>DAILY RECAP</span>
                    </div>
                    <table className={styles.luxuryTable}>
                        <thead>
                            <tr>
                                <th>Case ID</th>
                                <th>Participant</th>
                                <th>Primary Reason</th>
                                <th>Resolution Node</th>
                                <th>Execution</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { p: "CASE_8821", s: "Michael Chen", t: "Withdrawal Delay", d: "Legal Council", o: "SUCCESS" },
                                { p: "CASE_4432", s: "Sarah Williams", t: "Account Recovery", d: "Security Hub", o: "PENDING" },
                                { p: "CASE_1105", s: "Michael Chen", t: "KYC Re-verify", d: "Compliance", o: "SUCCESS" },
                                { p: "CASE_0091", s: "Michael Chen", t: "Priority Upgrade", d: "Support Lead", o: "SUCCESS" }
                            ].map((row, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 800 }}>{row.p}</td>
                                    <td style={{ color: "var(--luxury-accent)" }}>{row.s}</td>
                                    <td className={styles.dataText}>{row.t}</td>
                                    <td>{row.d}</td>
                                    <td>
                                        <span className={styles.badge} style={{
                                            background: row.o === "SUCCESS" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                            color: row.o === "SUCCESS" ? "var(--luxury-emerald)" : "var(--luxury-gold)"
                                        }}>
                                            {row.o}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <SystemAlerts />
        </div>
    );
};

export default CustomerCare;
