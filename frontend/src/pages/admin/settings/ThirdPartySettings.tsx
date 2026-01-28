import React from "react";
import styles from "./ThirdPartySettings.module.css";

const ThirdPartySettings: React.FC = () => {
    return (
        <div className={styles.page}>
            {/* GOOGLE reCAPTCHA */}
            <div className={styles.fullCard}>
                <h2>Google reCAPTCHA</h2>

                <div className={styles.grid}>
                    {/* SETTINGS */}
                    <div className={styles.card}>
                        <h3>Google reCAPTCHA Setting</h3>

                        <div className={styles.row}>
                            <label>Activation</label>
                            <label className={styles.switch}>
                                <input type="checkbox" />
                                <span className={styles.slider} />
                            </label>
                        </div>

                        <div className={styles.field}>
                            <label>Site KEY</label>
                            <input placeholder="Site KEY" />
                        </div>

                        <div className={styles.field}>
                            <label>SECRET KEY</label>
                            <input placeholder="SECRET KEY" />
                        </div>

                        <div className={styles.field}>
                            <label>Accept V3 Score</label>
                            <select>
                                <option>Select Score</option>
                                <option>0.3</option>
                                <option>0.5</option>
                                <option>0.7</option>
                                <option>0.9</option>
                            </select>
                            <small>
                                reCAPTCHA v3 score (0–1) estimates if a request is human or bot.
                            </small>
                        </div>

                        <div className={styles.actions}>
                            <button className={styles.saveBtn}>Save</button>
                        </div>
                    </div>

                    {/* INFO */}
                    <div className={styles.card}>
                        <h3>How to Interpret the reCAPTCHA V3 Scores</h3>

                        <ul className={styles.infoList}>
                            <li>
                                <b>Score 0.0 - 0.3:</b> Very likely a bot — block or verify.
                            </li>
                            <li>
                                <b>Score 0.3 - 0.5:</b> Suspicious activity.
                            </li>
                            <li>
                                <b>Score 0.5 - 0.7:</b> Possibly human.
                            </li>
                            <li>
                                <b>Score 0.7 - 0.9:</b> Likely human.
                            </li>
                            <li>
                                <b>Score 0.9 - 1.0:</b> Very likely human.
                            </li>
                            <li>
                                No credentials yet?{" "}
                                <a href="#" className={styles.link}>
                                    Register reCAPTCHA v3 here
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ENABLE FOR */}
                <div className={styles.card}>
                    <h3>Enable reCAPTCHA For</h3>

                    <div className={styles.toggleGrid}>
                        <div className={styles.row}>
                            <span>User Registration</span>
                            <label className={styles.switch}>
                                <input type="checkbox" />
                                <span className={styles.slider} />
                            </label>
                        </div>

                        <div className={styles.row}>
                            <span>Contact Us Form</span>
                            <label className={styles.switch}>
                                <input type="checkbox" />
                                <span className={styles.slider} />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* GOOGLE ANALYTICS */}
            <div className={styles.fullCard}>
                <h2>Google Analytics Settings</h2>

                <div className={styles.card}>
                    <div className={styles.row}>
                        <label>Activation</label>
                        <label className={styles.switch}>
                            <input type="checkbox" />
                            <span className={styles.slider} />
                        </label>
                    </div>

                    <div className={styles.field}>
                        <label>Tracking ID</label>
                        <input placeholder="Tracking ID" />
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.saveBtn}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThirdPartySettings;
