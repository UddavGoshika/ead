import React, { useState, useEffect } from "react";
import styles from "./AddonManager.module.css";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

/* ================= TYPES ================= */
interface Addon {
    id: number;
    name: string;
    version: string;
    image: string;
    enabled: boolean;
}

/* ================= COMPONENT ================= */
const AddonsManager: React.FC = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<"installed" | "available">(
        "installed"
    );
    const [addons, setAddons] = useState<Addon[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAddons = async () => {
        try {
            setLoading(true);
            const res = await api.get('/settings/site');
            if (res.data.success) {
                const fetchedAddons = res.data.settings.addons || [];
                if (fetchedAddons.length === 0) {
                    const defaultAddons = [
                        { id: 1, name: "Referral System", version: "1.0.0", image: "/assets/referral-icon.webp", enabled: true },
                        { id: 2, name: "Support Ticket System", version: "1.2.0", image: "/assets/support-icon.webp", enabled: true },
                        { id: 3, name: "OTP System", version: "1.0.5", image: "/assets/otp-icon.webp", enabled: true }
                    ];
                    setAddons(defaultAddons);
                } else {
                    setAddons(fetchedAddons);
                }
            }
        } catch (err) {
            console.error("Error fetching addons:", err);
            showToast("Failed to fetch addons", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddons();
    }, []);

    const toggleAddon = async (id: number) => {
        const updatedAddons = addons.map(a =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
        );
        const originalAddons = [...addons];
        setAddons(updatedAddons);

        try {
            await api.post('/settings/site', { addons: updatedAddons });
            showToast(`Addon ${updatedAddons.find(a => a.id === id)?.enabled ? 'enabled' : 'disabled'} successfully`);
        } catch (err) {
            console.error("Error toggling addon:", err);
            showToast("Failed to update addon status", "error");
            // Revert on error
            setAddons(originalAddons);
        }
    };

    const handleInstallClick = () => {
        showToast("Please upload the addon zip file to install or update.", "info");
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
                    <button className={styles.installBtn} onClick={handleInstallClick}>
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
