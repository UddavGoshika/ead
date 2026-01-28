import React, { useState } from "react";
import { Search, MessageSquare, Phone, MapPin, Shield, Star, Filter } from "lucide-react";
import styles from "./SupportRoles.module.css";
import SupportSidebar from "./SupportSidebar";
import SystemAlerts from "./SystemAlerts";
import { Link } from "react-router-dom";

interface DirectoryMember {
    id: string;
    name: string;
    role: "Advocate" | "Client";
    location: string;
    plan: string;
    rating: number;
    cases: number;
    avatar: string;
    status: "online" | "offline" | "away";
}

const MOCK_DIRECTORY: DirectoryMember[] = [
    { id: "M1", name: "Adv. Rajesh Kumar", role: "Advocate", location: "New Delhi, IN", plan: "Ultra Pro", rating: 4.9, cases: 142, avatar: "R", status: "online" },
    { id: "M2", name: "Sarah Williams", role: "Client", location: "London, UK", plan: "Pro", rating: 4.5, cases: 3, avatar: "S", status: "offline" },
    { id: "M3", name: "Adv. Amit Shah", role: "Advocate", location: "Mumbai, IN", plan: "Pro Lite", rating: 4.7, cases: 88, avatar: "A", status: "away" },
    { id: "M4", name: "Michael Chen", role: "Client", location: "Singapore, SG", plan: "Free", rating: 0, cases: 1, avatar: "M", status: "online" },
    { id: "M5", name: "Adv. Sneha Patil", role: "Advocate", location: "Pune, IN", plan: "Ultra Pro", rating: 4.8, cases: 120, avatar: "S", status: "online" },
    { id: "M6", name: "John Doe", role: "Client", location: "New York, US", plan: "Pro", rating: 4.2, cases: 5, avatar: "J", status: "online" },
];

const MemberDirectory: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"All" | "Advocate" | "Client">("All");

    const filteredMembers = MOCK_DIRECTORY.filter(m => {
        const matchesTab = activeTab === "All" || m.role === activeTab;
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className={styles.hubWrapper}>
            <SupportSidebar onUserSelect={() => { }} />

            <main className={styles.mainContent}>
                <header className={styles.pageHeader}>
                    <div className={styles.headerTitle}>
                        <h1>Member Intelligence</h1>
                        <p><Shield size={14} color="var(--luxury-accent)" /> Global Directory & Strategic Access</p>
                    </div>

                    <div className={styles.controls}>
                        <div className={styles.searchBox}>
                            <Search size={18} color="var(--luxury-accent)" />
                            <input
                                type="text"
                                placeholder="Scan for Name or Sector..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className={styles.controlBtn}>
                            <Filter size={16} /> Filter
                        </button>
                    </div>
                </header>

                <div className={styles.chatArea} style={{ padding: "40px" }}>
                    <div className={styles.filterTabs} style={{ padding: "0 0 20px 0", border: "none" }}>
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

                    <div className={styles.directoryGrid}>
                        {filteredMembers.map((member) => (
                            <div key={member.id} className={styles.memberCard}>
                                <div className={styles.memberCardHeader}>
                                    <div className={styles.memberAvatar}>
                                        {member.avatar}
                                        <div
                                            className={styles.statusIndicator}
                                            style={{
                                                background: member.status === "online" ? "#10b981" : member.status === "away" ? "#f59e0b" : "#64748b",
                                                bottom: "-4px",
                                                right: "-4px"
                                            }}
                                        />
                                    </div>
                                    <div className={styles.memberInfo}>
                                        <h3>{member.name}</h3>
                                        <p><MapPin size={10} style={{ marginRight: "4px" }} /> {member.location}</p>
                                    </div>
                                    <div style={{ marginLeft: "auto" }}>
                                        <span className={styles.badge} style={{
                                            background: member.plan === "Ultra Pro" ? "rgba(245, 158, 11, 0.1)" : "rgba(59, 130, 246, 0.1)",
                                            color: member.plan === "Ultra Pro" ? "var(--luxury-gold)" : "var(--luxury-accent)",
                                            border: `1px solid ${member.plan === "Ultra Pro" ? "rgba(245, 158, 11, 0.2)" : "rgba(59, 130, 246, 0.2)"}`
                                        }}>
                                            {member.plan}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.memberStats}>
                                    <div className={styles.statItem}>
                                        <span className={statLabel}>Rating</span>
                                        <span className={statValue} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Star size={12} color="var(--luxury-gold)" fill="var(--luxury-gold)" /> {member.rating || "N/A"}
                                        </span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={statLabel}>Total Cases</span>
                                        <span className={statValue}>{member.cases}</span>
                                    </div>
                                </div>

                                <div className={styles.memberActions}>
                                    <Link to="/support/chat" className={styles.actionBtn}>
                                        <MessageSquare size={14} /> Chat Now
                                    </Link>
                                    <Link to="/support/call" className={styles.actionBtn}>
                                        <Phone size={14} /> Call Now
                                    </Link>
                                </div>

                                {member.plan === "Ultra Pro" && (
                                    <div className={styles.scanning} style={{ opacity: 0.1 }}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <SystemAlerts />
            </main>
        </div>
    );
};

// Internal utility class names since I'm mixing styles
const statLabel = styles.statLabel;
const statValue = styles.statValue;

export default MemberDirectory;
