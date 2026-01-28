import React, { useState } from "react";
import styles from "./OtpCredentials.module.css";

const providers = [
    {
        title: "Twilio Credential",
        fields: ["TWILIO SID", "TWILIO AUTH TOKEN", "TWILIO VERIFY SID", "VALID TWILIO NUMBER"]
    },
    {
        title: "Fast2SMS Credential",
        fields: ["AUTH KEY", "ENTITY ID", "ROUTE", "LANGUAGE", "SENDER ID"]
    },
    {
        title: "MIMO Credential",
        fields: ["MIMO USERNAME", "MIMO PASSWORD", "MIMO SENDER ID"]
    },
    {
        title: "SSL Wireless Credential",
        fields: ["SSL SMS API TOKEN", "SSL SMS SID", "SSL SMS URL"]
    },
    {
        title: "Nexmo Credential",
        fields: ["NEXMO KEY", "NEXMO SECRET", "NEXMO SENDER ID"]
    },
    {
        title: "MIMSMS Credential",
        fields: ["MIM API KEY", "MIM SENDER ID"]
    }
];

const SetOtpCredentials: React.FC = () => {
    const [active, setActive] = useState<string | null>(null);

    return (
        <div className={styles.page}>
            <h2 className={styles.pageTitle}>SMS Gateway Settings</h2>

            <div className={styles.grid}>
                {providers.map((provider, idx) => (
                    <div className={styles.card} key={idx}>
                        <div className={styles.cardHeader}>
                            <h3>{provider.title}</h3>

                            {/* Toggle */}
                            <label className={styles.switch}>
                                <input type="checkbox" />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        <div className={styles.form}>
                            {provider.fields.map((field, i) => (
                                <div className={styles.formRow} key={i}>
                                    <label>{field}</label>
                                    <input type="text" placeholder={field} />
                                </div>
                            ))}
                        </div>

                        <div className={styles.actions}>
                            <button className={styles.saveBtn}>Save</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SetOtpCredentials;
