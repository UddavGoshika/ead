import React from "react";
import styles from "./ServerStatus.module.css";

type ServiceStatus = "online" | "degraded" | "offline";

interface Service {
    name: string;
    status: ServiceStatus;
}

const services: Service[] = [
    { name: "API Gateway", status: "online" },
    { name: "Authentication Service", status: "online" },
    { name: "Database", status: "online" },
    { name: "File Storage", status: "degraded" },
    { name: "Cron Jobs", status: "online" },
];

const ServerStatus: React.FC = () => {
    return (
        <div className={styles.page}>
            <div className={styles.card}>
                {/* HEADER */}
                <div className={styles.header}>
                    <h1>Server Status</h1>
                    <span className={styles.statusBadge}>Operational</span>
                </div>

                {/* METRICS */}
                <div className={styles.metricsGrid}>
                    <div className={styles.metricBox}>
                        <h4>CPU Usage</h4>
                        <div className={styles.progress}>
                            <span style={{ width: "42%" }} />
                        </div>
                        <p>42%</p>
                    </div>

                    <div className={styles.metricBox}>
                        <h4>Memory Usage</h4>
                        <div className={styles.progress}>
                            <span style={{ width: "68%" }} />
                        </div>
                        <p>6.8 / 10 GB</p>
                    </div>

                    <div className={styles.metricBox}>
                        <h4>Disk Usage</h4>
                        <div className={styles.progress}>
                            <span style={{ width: "54%" }} />
                        </div>
                        <p>540 / 1000 GB</p>
                    </div>

                    <div className={styles.metricBox}>
                        <h4>Uptime</h4>
                        <p className={styles.uptime}>99.98%</p>
                        <small>Last 30 days</small>
                    </div>
                </div>

                {/* SERVICES */}
                <div className={styles.section}>
                    <h3>Core Services</h3>

                    <div className={styles.serviceList}>
                        {services.map((service) => (
                            <div key={service.name} className={styles.serviceRow}>
                                <span>{service.name}</span>
                                <span
                                    className={`${styles.serviceStatus} ${service.status === "online"
                                            ? styles.green
                                            : service.status === "degraded"
                                                ? styles.orange
                                                : styles.red
                                        }`}
                                >
                                    {service.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* INCIDENT LOG */}
                <div className={styles.section}>
                    <h3>Recent Incidents</h3>

                    <div className={styles.log}>
                        <div className={styles.logRow}>
                            <span>Storage latency detected</span>
                            <span className={styles.orange}>Resolved</span>
                            <small>2 hours ago</small>
                        </div>

                        <div className={styles.logRow}>
                            <span>Database maintenance completed</span>
                            <span className={styles.green}>Info</span>
                            <small>1 day ago</small>
                        </div>

                        <div className={styles.logRow}>
                            <span>Scheduled system update</span>
                            <span className={styles.blue}>Planned</span>
                            <small>3 days ago</small>
                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className={styles.actions}>
                    <button className={styles.refreshBtn}>Refresh Status</button>
                    <button className={styles.reportBtn}>View Full Report</button>
                </div>
            </div>
        </div>
    );
};

export default ServerStatus;
