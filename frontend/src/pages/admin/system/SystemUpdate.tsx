import React, { useState } from "react";
import styles from "./SystemUpdate.module.css";

type UpdateStatus = "up_to_date" | "update_available" | "updating";

const SystemUpdate: React.FC = () => {
    const [status, setStatus] = useState<UpdateStatus>("update_available");
    const [maintenance, setMaintenance] = useState(false);

    const handleUpdate = () => {
        setStatus("updating");

        // simulate update process
        setTimeout(() => {
            setStatus("up_to_date");
        }, 3000);
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                {/* HEADER */}
                <div className={styles.header}>
                    <h1>System Update</h1>
                    <span className={styles.badge}>
                        {status === "up_to_date"
                            ? "System is up to date"
                            : status === "updating"
                                ? "Updating..."
                                : "Update Available"}
                    </span>
                </div>

                {/* SYSTEM INFO */}
                <div className={styles.grid}>
                    <div className={styles.infoBox}>
                        <h4>Current Version</h4>
                        <p>v2.4.1</p>
                    </div>

                    <div className={styles.infoBox}>
                        <h4>Latest Version</h4>
                        <p>v2.5.0</p>
                    </div>

                    <div className={styles.infoBox}>
                        <h4>Last Updated</h4>
                        <p>12 Aug 2025</p>
                    </div>

                    <div className={styles.infoBox}>
                        <h4>Server Status</h4>
                        <p className={styles.green}>Online</p>
                    </div>
                </div>

                {/* CHANGELOG */}
                <div className={styles.section}>
                    <h3>Changelog</h3>
                    <ul className={styles.changelog}>
                        <li>✔ Improved referral calculation accuracy</li>
                        <li>✔ Security patches & performance optimizations</li>
                        <li>✔ Admin dashboard UI enhancements</li>
                        <li>✔ Bug fixes in payment gateway</li>
                    </ul>
                </div>

                {/* MAINTENANCE MODE */}
                <div className={styles.section}>
                    <h3>Maintenance Mode</h3>
                    <div className={styles.maintenanceRow}>
                        <p>
                            Temporarily disable user access during updates or maintenance.
                        </p>

                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={maintenance}
                                onChange={() => setMaintenance(!maintenance)}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className={styles.actions}>
                    <button
                        className={styles.updateBtn}
                        disabled={status === "updating" || status === "up_to_date"}
                        onClick={handleUpdate}
                    >
                        {status === "updating" ? "Updating..." : "Run System Update"}
                    </button>

                    <button className={styles.rollbackBtn}>
                        Rollback Previous Version
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemUpdate;
