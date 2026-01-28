import React, { useState } from "react";
import styles from "./AddonManager.module.css";
import AdminPageHeader from "../../components/admin/AdminPageHeader";

/* ================= TYPES ================= */
interface Addon {
    id: number;
    name: string;
    version: string;
    image: string;
    enabled: boolean;
}

/* ================= DATA ================= */
const installedAddons: Addon[] = [
    {
        id: 1,
        name: "OTP",
        version: "1.4",
        image: "/assets/otp.png",
        enabled: true,
    },
    {
        id: 2,
        name: "Referral System",
        version: "1.1",
        image: "/assets/image copy.png",
        enabled: true,
    },
    {
        id: 3,
        name: "Support Ticket",
        version: "1.1",
        image: "/assets/image copy.png",
        enabled: true,
    },
];

/* ================= COMPONENT ================= */
const AddonsManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"installed" | "available">(
        "installed"
    );
    const [addons, setAddons] = useState(installedAddons);

    const toggleAddon = (id: number) => {
        setAddons(prev =>
            prev.map(a =>
                a.id === id ? { ...a, enabled: !a.enabled } : a
            )
        );
    };

    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Addon Manager"
                onSearch={(q) => console.log('Searching addons', q)}
                placeholder="Search addons..."
            />

            {/* ================= TOP BAR ================= */}
            <div className={styles.topBar}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === "installed" ? styles.active : ""
                            }`}
                        onClick={() => setActiveTab("installed")}
                    >
                        Installed Addon
                    </button>

                    <button
                        className={`${styles.tab} ${activeTab === "available" ? styles.active : ""
                            }`}
                        onClick={() => setActiveTab("available")}
                    >
                        Available Addon
                    </button>
                </div>

                <div className={styles.headerActionsSecondary}>
                    <button className={styles.installBtn}>
                        Install/Update Addon
                    </button>
                </div>
            </div>

            {/* ================= CONTENT ================= */}
            {activeTab === "installed" && (
                <div className={styles.card}>
                    {addons.map(addon => (
                        <div key={addon.id} className={styles.addonRow}>
                            <div className={styles.addonInfo}>
                                <img
                                    src={addon.image}
                                    alt={addon.name}
                                    className={styles.addonImage}
                                />

                                <div>
                                    <h4>{addon.name}</h4>
                                    <span className={styles.version}>
                                        Version: {addon.version}
                                    </span>
                                </div>
                            </div>

                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={addon.enabled}
                                    onChange={() => toggleAddon(addon.id)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "available" && (
                <div className={styles.empty}>
                    <p>No available addons to install.</p>
                </div>
            )}
        </div>
    );
};

export default AddonsManager;
