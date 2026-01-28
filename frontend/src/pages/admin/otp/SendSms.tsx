import React, { useState } from "react";
import styles from "./SendSms.module.css";

const mockUsers = [
    "Rohan Mehta",
    "Aarav Sharma",
    "Neha Patel",
    "Rahul Verma",
    "Pooja Singh"
];

const SendBulkSMS: React.FC = () => {
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [sms, setSms] = useState("");
    const [templateId, setTemplateId] = useState("");

    const toggleUser = (user: string) => {
        setSelectedUsers((prev) =>
            prev.includes(user)
                ? prev.filter((u) => u !== user)
                : [...prev, user]
        );
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h2 className={styles.title}>Send Bulk SMS</h2>

                {/* USERS */}
                <div className={styles.formGroup}>
                    <label>Mobile Users</label>
                    <div className={styles.multiSelect}>
                        {mockUsers.map((user) => (
                            <div
                                key={user}
                                className={`${styles.userItem} ${selectedUsers.includes(user) ? styles.selected : ""
                                    }`}
                                onClick={() => toggleUser(user)}
                            >
                                {user}
                            </div>
                        ))}
                    </div>
                </div>

                {/* SMS CONTENT */}
                <div className={styles.formGroup}>
                    <label>SMS Content</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Type your SMS content here..."
                        value={sms}
                        onChange={(e) => setSms(e.target.value)}
                    />
                </div>

                {/* TEMPLATE ID */}
                <div className={styles.formGroup}>
                    <label>Template ID</label>
                    <input
                        className={styles.input}
                        placeholder="Template ID"
                        value={templateId}
                        onChange={(e) => setTemplateId(e.target.value)}
                    />
                    <small className={styles.note}>
                        ** N.B: Template ID is Required Only for Fast2SMS DLT Manual **
                    </small>
                </div>

                {/* ACTION */}
                <div className={styles.actions}>
                    <button className={styles.sendBtn}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default SendBulkSMS;
