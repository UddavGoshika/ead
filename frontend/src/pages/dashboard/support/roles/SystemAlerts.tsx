import React, { useState } from "react";
import { Bell, Zap, Shield, MessageSquare, Phone, X, AlertTriangle } from "lucide-react";
import styles from "./SupportRoles.module.css";

interface Alert {
    id: string;
    type: "chat" | "call" | "system" | "security";
    message: string;
    time: string;
    level: "low" | "medium" | "high";
}

const MOCK_ALERTS: Alert[] = [
    { id: "A1", type: "chat", message: "Incoming signal from [Michael Chen]", time: "Just now", level: "medium" },
    { id: "A2", type: "security", message: "Biometric override detected in Sector 4", time: "2m ago", level: "high" },
    { id: "A3", type: "call", message: "Missed transmission from Sarah Williams", time: "5m ago", level: "low" },
    { id: "A4", type: "system", message: "Quantum node synchronization complete", time: "10m ago", level: "low" },
];

const SystemAlerts: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);

    const getIcon = (type: string) => {
        switch (type) {
            case "chat": return <MessageSquare size={16} />;
            case "call": return <Phone size={16} />;
            case "security": return <Shield size={16} />;
            default: return <Zap size={16} />;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case "high": return "var(--luxury-rose)";
            case "medium": return "var(--luxury-gold)";
            default: return "var(--luxury-accent)";
        }
    };

    return (
        <>
            <button
                className={styles.primaryAction}
                style={{
                    position: "fixed",
                    bottom: "30px",
                    right: "30px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1100,
                    padding: 0
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={24} className={isOpen ? "" : styles.glowPulse} />
                {alerts.length > 0 && (
                    <span style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        width: "12px",
                        height: "12px",
                        background: "var(--luxury-rose)",
                        borderRadius: "50%",
                        border: "2px solid var(--luxury-bg)"
                    }} />
                )}
            </button>

            {isOpen && (
                <div className={styles.notificationTray}>
                    <div className={styles.trayHeader}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Activity size={16} color="var(--luxury-accent)" />
                            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }}>Signal Stream</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: "transparent", border: "none", color: "var(--luxury-text-muted)", cursor: "pointer" }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className={styles.trayList}>
                        {alerts.length === 0 ? (
                            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--luxury-text-muted)" }}>
                                <AlertTriangle size={32} style={{ marginBottom: "15px", opacity: 0.2 }} />
                                <p style={{ fontSize: "12px", margin: 0 }}>All sectors currently silent</p>
                            </div>
                        ) : (
                            alerts.map((alert) => (
                                <div key={alert.id} className={styles.notifItem}>
                                    <div className={styles.notifIcon} style={{ background: `${getLevelColor(alert.level)}1a`, color: getLevelColor(alert.level) }}>
                                        {getIcon(alert.type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#fff" }}>{alert.message}</p>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                                            <span style={{ fontSize: "10px", color: "var(--luxury-text-muted)", fontWeight: 700 }}>{alert.time}</span>
                                            <span style={{ fontSize: "10px", color: getLevelColor(alert.level), fontWeight: 900, textTransform: "uppercase" }}>{alert.level}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {alerts.length > 0 && (
                        <div style={{ padding: "15px", borderTop: "1px solid var(--luxury-border)", background: "rgba(0,0,0,0.2)" }}>
                            <button
                                onClick={() => setAlerts([])}
                                className={styles.controlBtn}
                                style={{ width: "100%", justifyContent: "center", border: "none", background: "transparent", color: "var(--luxury-rose)" }}
                            >
                                Clear All Signal History
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

// Internal utility since Activity icon was missed in previous write but available in system
const Activity = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size || 24}
        height={props.size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

export default SystemAlerts;
