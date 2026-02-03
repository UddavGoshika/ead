import React, { useEffect, useState } from 'react';
import styles from "./mycases.module.css";
import { caseService } from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";
import { Loader2 } from "lucide-react";
import type { Case } from "../../../../types";

// Assume Case type is defined in types or we define a local interface if missing
// But api.ts uses Case, so it should be in types.

const Cases = () => {
    const { user } = useAuth();
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await caseService.getCases();
                // Response is { success: true, cases: [...] } according to my api.ts update
                setCases(response.data.cases);
            } catch (err) {
                console.error("Failed to fetch cases", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, []);

    if (loading) {
        return (
            <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Loader2 className="animate-spin" size={48} color="#facc15" />
            </div>
        );
    }

    return (
        <div className={styles.container}>

            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search by Case ID or Title..."
                        className={styles.dashboardSearchInput}
                    />
                    <button className={styles.searchBtnInside}>Search</button>
                </div>

                {/* Filters could be implemented similar to AdvocatesList if needed */}
                <select className={styles.filterSelect}>
                    <option>Department</option>
                </select>
                <select className={styles.filterSelect}>
                    <option>Status</option>
                </select>

                <button className={styles.submitBtnDashboard}>Apply</button>
            </div>

            {cases.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '50px' }}>
                    <h3>No cases found</h3>
                    <p>File a new case to get started.</p>
                </div>
            ) : (
                cases.map((item: any, idx) => (
                    <div key={item._id || idx} className={styles.card}>
                        {/* Left */}
                        <div className={styles.left}>
                            <h2>{item.title}</h2>
                            <p className={styles.caseId}>{item.caseId}</p>
                            <span className={styles.status} style={{
                                color: item.status === 'Open' ? '#facc15' : item.status === 'Closed' ? '#ef4444' : '#38bdf8'
                            }}>
                                {item.status}
                            </span>

                            <p className={styles.update}>Last update: {new Date(item.updatedAt || item.lastUpdate).toLocaleDateString()}</p>

                            <div className={styles.actions}>
                                <button>Chat</button>
                                <button>Details</button>
                            </div>
                        </div>

                        {/* Right */}
                        <div className={styles.right}>
                            {item.advocateId ? (
                                <>
                                    <div className={styles.avatar}>
                                        <img
                                            src={item.advocateId.image_url || "https://via.placeholder.com/50"}
                                            alt="Advocate"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                        />
                                    </div>
                                    <div className={styles.profile}>
                                        <strong>{item.advocateId.name}</strong>
                                        <div className={styles.code}>
                                            🛡️ {item.advocateId.unique_id}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className={styles.profile}>
                                    <strong>Unassigned</strong>
                                    <div className={styles.code}>
                                        Waiting for Advocate
                                    </div>
                                </div>
                            )}
                            <span className={styles.view}>View Details</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Cases;
