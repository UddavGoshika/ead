import React, { useState } from 'react';
import styles from './DailyWorkLog.module.css';
import { MdSend, MdDone, MdTrendingUp, MdNotes } from 'react-icons/md';

interface DailyWorkLogProps {
    role: string;
    agentName?: string;
}

const DailyWorkLog: React.FC<DailyWorkLogProps> = ({ role, agentName = "Agent" }) => {
    const [membersHandled, setMembersHandled] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulating API call to reporting service
        setTimeout(() => {
            console.log(`WORK LOG SUBMITTED [${new Date().toISOString()}]`, {
                role,
                agentName,
                membersHandled,
                notes
            });
            setIsSubmitting(false);
            setIsSuccess(true);
            setMembersHandled('');
            setNotes('');

            // Reset success message after 3 seconds
            setTimeout(() => setIsSuccess(false), 3000);
        }, 1200);
    };

    return (
        <div className={styles.workLogContainer}>
            <div className={styles.header}>
                <h3>Operation Reporting</h3>
                <p>Log your daily throughput and strategic notes below.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.statGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <MdTrendingUp size={14} style={{ marginRight: '4px' }} />
                            Members Handled
                        </label>
                        <input
                            type="number"
                            className={styles.input}
                            placeholder="e.g. 45"
                            value={membersHandled}
                            onChange={(e) => setMembersHandled(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <MdNotes size={14} style={{ marginRight: '4px' }} />
                            Role Identity
                        </label>
                        <input
                            type="text"
                            className={styles.input}
                            value={role}
                            disabled
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Interaction & Case Notes</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Detail specific roadblocks, member feedback, or escalated cases..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Transmitting...' : (
                        <>
                            <MdSend size={18} />
                            Submit Daily Manifest
                        </>
                    )}
                </button>

                {isSuccess && (
                    <div className={styles.successMsg}>
                        <MdDone size={18} />
                        Report synced with Team Lead dashboard.
                    </div>
                )}
            </form>
        </div>
    );
};

export default DailyWorkLog;
