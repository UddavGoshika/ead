import React from "react";
import styles from "./SocialLogin.module.css";

const SocialLoginSettings: React.FC = () => {
    return (
        <div className={styles.page}>
            {/* GOOGLE */}
            <div className={styles.card}>
                <h3>Google Login Credential</h3>

                <div className={styles.row}>
                    <label>Activation</label>
                    <label className={styles.switch}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.slider} />
                    </label>
                </div>

                <div className={styles.field}>
                    <label>Client ID</label>
                    <input placeholder="Google Client ID" />
                </div>

                <div className={styles.field}>
                    <label>Client Secret</label>
                    <input placeholder="Google Client Secret" />
                </div>

                <div className={styles.actions}>
                    <button className={styles.saveBtn}>Save</button>
                </div>
            </div>

            {/* FACEBOOK */}
            <div className={styles.card}>
                <h3>Facebook Login Credential</h3>

                <div className={styles.row}>
                    <label>Activation</label>
                    <label className={styles.switch}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.slider} />
                    </label>
                </div>

                <div className={styles.field}>
                    <label>App ID</label>
                    <input defaultValue="hjh" />
                </div>

                <div className={styles.field}>
                    <label>App Secret</label>
                    <input defaultValue="hgfgh" />
                </div>

                <div className={styles.actions}>
                    <button className={styles.saveBtn}>Save</button>
                </div>
            </div>

            {/* TWITTER */}
            <div className={styles.card}>
                <h3>Twitter Login Credential</h3>

                <div className={styles.row}>
                    <label>Activation</label>
                    <label className={styles.switch}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.slider} />
                    </label>
                </div>

                <div className={styles.field}>
                    <label>Client ID</label>
                    <input defaultValue="3" />
                </div>

                <div className={styles.field}>
                    <label>Client Secret</label>
                    <input defaultValue="4" />
                </div>

                <div className={styles.actions}>
                    <button className={styles.saveBtn}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default SocialLoginSettings;
