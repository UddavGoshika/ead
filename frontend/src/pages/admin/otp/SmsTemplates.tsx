import React, { useState } from "react";
import styles from "./SmsTemplates.module.css";

const templates = [
    "Mobile Number Verification",
    "Account Opening By Admin",
    "Account Approval",
    "Staff Account Opening",
    "Manual Payment Approval",
    "Express Interest",
    "Accept Interest",
    "Password Reset",
    "Profile Picture View Request",
    "Profile Picture View Request Accepted",
    "Gallery Image View Request",
    "Gallery Image View Request Accepted",
];

const SmsTemplates: React.FC = () => {
    const [active, setActive] = useState(templates[0]);

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.pageTitle}>SMS Templates</h2>

            <div className={styles.card}>
                {/* LEFT */}
                <div className={styles.sidebar}>
                    {templates.map((item) => (
                        <div
                            key={item}
                            className={`${styles.templateItem} ${active === item ? styles.active : ""
                                }`}
                            onClick={() => setActive(item)}
                        >
                            {item}
                        </div>
                    ))}
                </div>

                {/* RIGHT */}
                <div className={styles.editor}>
                    <div className={styles.formGroup}>
                        <label>SMS Body</label>
                        <textarea
                            className={styles.textarea}
                            defaultValue="[[code]] is your verification code for [[site_name]].[[url]]"
                        />
                        <small className={styles.note}>
                            ** N.B: Do Not Change The Variables Like [[ ____ ]] **
                        </small>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Template ID</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Template ID"
                        />
                        <small className={styles.note}>
                            ** N.B: Template ID is Required Only for Fast2SMS **
                        </small>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.updateBtn}>Update Settings</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmsTemplates;
