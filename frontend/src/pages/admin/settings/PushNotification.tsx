import React from "react";
import styles from "./PushNotification.module.css";

const FirebasePushSettings: React.FC = () => {
    return (
        <div className={styles.page}>
            {/* SETTINGS */}
            <div className={styles.card}>
                <h3>Firebase Push Notification</h3>

                <div className={styles.row}>
                    <label>Activation</label>
                    <label className={styles.switch}>
                        <input type="checkbox" />
                        <span className={styles.slider} />
                    </label>
                </div>

                <div className={styles.field}>
                    <label>FCM API KEY</label>
                    <input placeholder="FCM API KEY" />
                </div>

                <div className={styles.field}>
                    <label>FCM AUTH DOMAIN</label>
                    <input placeholder="FCM AUTH DOMAIN" />
                </div>

                <div className={styles.field}>
                    <label>FCM PROJECT ID</label>
                    <input placeholder="FCM PROJECT ID" />
                </div>

                <div className={styles.field}>
                    <label>FCM STORAGE BUCKET</label>
                    <input placeholder="FCM STORAGE BUCKET" />
                </div>

                <div className={styles.field}>
                    <label>FCM MESSAGING SENDER ID</label>
                    <input placeholder="FCM MESSAGING SENDER ID" />
                </div>

                <div className={styles.field}>
                    <label>FCM APP ID</label>
                    <input placeholder="FCM APP ID" />
                </div>

                <div className={styles.field}>
                    <label>FIREBASE SERVER KEY</label>
                    <input placeholder="FIREBASE SERVER KEY" />
                </div>

                <div className={styles.actions}>
                    <button className={styles.saveBtn}>Save</button>
                </div>
            </div>

            {/* INSTRUCTIONS */}
            <div className={styles.card}>
                <h3>
                    Please be careful when you are configuring Firebase Push Notification.
                </h3>

                <ol className={styles.instructions}>
                    <li>
                        Log in to Google Firebase and create a new app if you don’t have any.
                    </li>
                    <li>Go to Project Settings and select the General tab.</li>
                    <li>Select Config to find Firebase Config Credentials.</li>
                    <li>
                        Copy your App’s credentials and paste them into the appropriate
                        fields.
                    </li>
                    <li>
                        Select Cloud Messaging tab and enable Cloud Messaging API.
                    </li>
                    <li>
                        After enabling Cloud Messaging API, copy the Server Key and paste it
                        into FIREBASE SERVER KEY field.
                    </li>
                    <li>
                        Configure the <b>firebase-messaging-sw.js</b> file and keep it in the
                        root directory of your cPanel.
                    </li>
                </ol>
            </div>
        </div>
    );
};

export default FirebasePushSettings;
