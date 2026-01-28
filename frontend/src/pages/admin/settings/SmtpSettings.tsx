import React from "react";
import styles from "./SmtpSettings.module.css";

const SmtpSettings: React.FC = () => {
    return (
        <div className={styles.page}>
            {/* SMTP SETTINGS */}
            <div className={styles.card}>
                <h3>SMTP Settings</h3>

                <div className={styles.form}>
                    <div className={styles.field}>
                        <label>Type</label>
                        <select>
                            <option>SMTP</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label>MAIL HOST</label>
                        <input defaultValue="activeitzone.com" />
                    </div>

                    <div className={styles.field}>
                        <label>MAIL PORT</label>
                        <input defaultValue="250" />
                    </div>

                    <div className={styles.field}>
                        <label>MAIL USERNAME</label>
                        <input defaultValue="test@beforepurchase.com" />
                    </div>

                    <div className={styles.field}>
                        <label>MAIL PASSWORD</label>
                        <input type="password" placeholder="MAIL PASSWORD" />
                    </div>

                    <div className={styles.field}>
                        <label>MAIL ENCRYPTION</label>
                        <input defaultValue="tls" />
                    </div>

                    <div className={styles.field}>
                        <label>MAIL FROM ADDRESS</label>
                        <input defaultValue="test@beforepurchase.com" />
                    </div>

                    <div className={styles.field}>
                        <label>MAIL FROM NAME</label>
                        <input defaultValue="beforepurchase.com" />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.primaryBtn}>Update</button>
                </div>
            </div>

            {/* INSTRUCTION */}
            <div className={styles.card}>
                <h3>Instruction</h3>

                <p className={styles.warning}>
                    Please be careful when you are configuring SMTP. For incorrect
                    configuration you will get error at the time of order place, new
                    registration, sending newsletter.
                </p>

                <div className={styles.instructionBlock}>
                    <h4>For Non-SSL</h4>
                    <ul>
                        <li>Select sendmail for Mail Driver if you face any issue</li>
                        <li>Set Mail Host according to your server manual settings</li>
                        <li>Set Mail port as 587</li>
                        <li>Set Mail Encryption as ssl if tls fails</li>
                    </ul>
                </div>

                <div className={styles.instructionBlock}>
                    <h4>For SSL</h4>
                    <ul>
                        <li>Select sendmail for Mail Driver if you face any issue</li>
                        <li>Set Mail Host according to your server manual settings</li>
                        <li>Set Mail port as 465</li>
                        <li>Set Mail Encryption as ssl</li>
                    </ul>
                </div>
            </div>

            {/* TEST SMTP */}
            <div className={styles.card}>
                <h3>Test SMTP configuration</h3>

                <div className={styles.inline}>
                    <input
                        placeholder="admin@example.com"
                        defaultValue="admin@example.com"
                    />
                    <button className={styles.primaryBtn}>Send test email</button>
                </div>
            </div>
        </div>
    );
};

export default SmtpSettings;
