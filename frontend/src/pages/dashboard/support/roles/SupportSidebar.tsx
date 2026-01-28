import React, { useState } from "react";
import styles from "./SupportRoles.module.css";
import { Search, Radio, Shield, Target, Users, Image, Activity, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface User {
    id: string;
    name: string;
    type: "Advocate" | "Client";
    status: "online" | "offline" | "away";
    lastMsg: string;
    unread: number;
    priority: "High" | "Medium" | "Low";
}

const MOCK_USERS: User[] = [
    { id: "Q1", name: "Adv. Rajesh Kumar", type: "Advocate", status: "online", lastMsg: "Uplink Secure | Case #882 Active", unread: 2, priority: "High" },
    { id: "Q2", name: "Sarah Williams", type: "Client", status: "offline", lastMsg: "Signal Lost | Protocol Terminated", unread: 0, priority: "Low" },
    { id: "Q3", name: "Adv. Amit Shah", type: "Advocate", status: "away", lastMsg: "Hibernation Mode | Sector 4 Gates", unread: 5, priority: "Medium" },
    { id: "Q4", name: "Michael Chen", type: "Client", status: "online", lastMsg: "Priority Request | Verification Pushed", unread: 1, priority: "High" },
    { id: "Q5", name: "Adv. Sneha Patil", type: "Advocate", status: "online", lastMsg: "Scanning Completed | Data Syncing", unread: 0, priority: "Medium" },
];

interface SupportSidebarProps {
    onUserSelect: (user: User) => void;
    activeUserId?: string;
    agentRole?: "Admin" | "Chat" | "Telecaller";
}

const SupportSidebar: React.FC<SupportSidebarProps> = ({ onUserSelect, activeUserId, agentRole = "Admin" }) => {
    const [activeTab, setActiveTab] = useState<"All" | "Advocate" | "Client">("All");
    const [searchTerm, setSearchTerm] = useState("");
    const location = useLocation();

    const navItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/support/care", roles: ["Admin"] },
        { label: "Directory", icon: Users, path: "/support/directory", roles: ["Admin", "Chat", "Telecaller"] },
        { label: "Chat Hub", icon: Activity, path: "/support/chat", roles: ["Admin", "Chat"] },
        { label: "Live OPS", icon: Radio, path: "/support/live", roles: ["Admin", "Chat"] },
        { label: "Call Deck", icon: Shield, path: "/support/call", roles: ["Admin", "Telecaller"] },
        { label: "Media Vault", icon: Image, path: "/support/images", roles: ["Admin", "Chat"] },
    ];

    const visibleNav = navItems.filter(item => item.roles.includes(agentRole));

    const filteredUsers = MOCK_USERS.filter(u => {
        const matchesTab = activeTab === "All" || u.type === activeTab;
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <h2>Command Hub</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "25px" }}>
                    {visibleNav.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`${styles.userCard} ${location.pathname === item.path ? styles.activeUser : ""}`}
                            style={{ padding: "12px 15px", marginBottom: "0" }}
                        >
                            <item.icon size={18} color={location.pathname === item.path ? "var(--luxury-accent)" : "#64748b"} />
                            <span style={{ fontSize: "13px", fontWeight: 700, color: location.pathname === item.path ? "#fff" : "#94a3b8" }}>{item.label}</span>
                        </Link>
                    ))}
                </div>

                <div className={styles.searchBox}>
                    <Search size={18} color="rgba(59, 130, 246, 0.5)" />
                    <input
                        type="text"
                        placeholder="Scan Identity Signal..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.filterTabs}>
                {["All", "Advocate", "Client"].map((tab) => (
                    <button
                        key={tab}
                        className={`${styles.filterTab} ${activeTab === tab ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab(tab as any)}
                    >
                        {tab}s
                    </button>
                ))}
            </div>

            <div className={styles.userList}>
                {filteredUsers.map((user) => (
                    <div
                        key={user.id}
                        className={`${styles.userCard} ${activeUserId === user.id ? styles.activeUser : ""}`}
                        onClick={() => onUserSelect(user)}
                    >
                        <div
                            className={styles.avatar}
                            style={{
                                background: user.type === "Advocate" ? "rgba(59, 130, 246, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                color: user.type === "Advocate" ? "var(--luxury-accent)" : "var(--luxury-gold)",
                                border: `1px solid ${user.type === "Advocate" ? "rgba(59, 130, 246, 0.2)" : "rgba(245, 158, 11, 0.2)"}`
                            }}
                        >
                            {user.name.charAt(0)}
                            <div
                                className={styles.statusIndicator}
                                style={{
                                    background: user.status === "online" ? "#10b981" : user.status === "away" ? "#f59e0b" : "#64748b",
                                    boxShadow: user.status === "online" ? "0 0 10px #10b981" : "none"
                                }}
                            />
                        </div>
                        <div className={styles.userMainInfo}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span className={styles.userName}>{user.name}</span>
                                {user.priority === "High" && <Target size={12} color="var(--luxury-rose)" />}
                            </div>
                            <span className={styles.userMeta}>
                                <Radio size={10} style={{ marginRight: "4px" }} />
                                {user.lastMsg.length > 32 ? user.lastMsg.substring(0, 29) + "..." : user.lastMsg}
                            </span>
                        </div>
                        {user.unread > 0 && <span className={styles.unreadBadge}>{user.unread}</span>}
                    </div>
                ))}
            </div>

            <div style={{ padding: "25px", borderTop: "1px solid var(--luxury-border)", background: "rgba(0,0,0,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
                    <Shield size={16} color="var(--luxury-accent)" className={styles.glowPulse} />
                    <span style={{ fontSize: "11px", fontWeight: 900, color: "var(--luxury-accent)", letterSpacing: "1px" }}>SECURE NODE: ACTIVE</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <div style={{ flex: 1, height: "4px", background: "var(--luxury-accent)", borderRadius: "2px", opacity: 0.3 }} />
                    <div style={{ flex: 1, height: "4px", background: "var(--luxury-accent)", borderRadius: "2px", opacity: 0.1 }} />
                    <div style={{ flex: 1, height: "4px", background: "var(--luxury-accent)", borderRadius: "2px", opacity: 0.1 }} />
                </div>
            </div>

            <div style={{ padding: "25px", borderTop: "1px solid var(--luxury-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 900, color: "#64748b", textTransform: "uppercase" }}>Quantum Load</span>
                    <span style={{ fontSize: "10px", fontWeight: 900, color: "var(--luxury-accent)" }}>0.4 ms</span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ width: "42%", height: "100%", background: "linear-gradient(to right, var(--luxury-accent), var(--luxury-gold))", boxShadow: "0 0 10px var(--luxury-accent)" }}></div>
                </div>
                <div style={{ marginTop: "15px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }}></div>
                        <span style={{ fontSize: "9px", fontWeight: 800 }}>SYNC: OK</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Activity size={10} color="var(--luxury-accent)" />
                        <span style={{ fontSize: "9px", fontWeight: 800 }}>UPLINK: ACTV</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SupportSidebar;
export type { User };
