import React from "react";
import styles from "./cookiepolicy.module.css";

const CookiePolicy: React.FC = () => {
    return (
        <section className={styles.termsSection}>
            <div className={styles.container}>
                <h4>Cookie Policy</h4>

                {/*
        <p className={styles.updated}>
          E-Advocate Services<br />
          Last updated: <strong>[Add Date]</strong>
        </p>
        */}

                <p>
                    This Cookie Policy explains how E-Advocate Services
                    uses cookies and similar technologies when you visit or use our website and related
                    online services.
                </p>

                <p>
                    By continuing to use our website, you consent to the use of cookies as described
                    in this policy.
                </p>

                <hr />

                <h4>1. What Are Cookies?</h4>
                <p>
                    Cookies are small text files stored on your device (computer, mobile, or tablet)
                    when you visit a website. They help websites function properly, improve user
                    experience, and provide security.
                </p>

                <h4>2. Types of Cookies We Use</h4>

                <h4>A. Strictly Necessary Cookies</h4>
                <p>
                    These cookies are essential for the website to function and cannot be disabled.
                    They are used for:
                </p>
                <ul>
                    <li>User authentication</li>
                    <li>Session management</li>
                    <li>Security and fraud prevention</li>
                    <li>Load balancing</li>
                </ul>

                <p>
                    Without these cookies, the website may not work correctly.
                </p>

                <h4>B. Functional Cookies</h4>
                <p>
                    These cookies help improve usability and remember user preferences such as:
                </p>
                <ul>
                    <li>Language selection</li>
                    <li>Region or location</li>
                    <li>Login preferences</li>
                </ul>

                <p>
                    These cookies do not collect personal data for advertising.
                </p>

                <h4>C. Performance & Analytics Cookies</h4>
                <p>
                    These cookies help us understand how users interact with the website by collecting
                    anonymous usage data, such as:
                </p>
                <ul>
                    <li>Pages visited</li>
                    <li>Time spent on pages</li>
                    <li>Error logs</li>
                </ul>

                <p>
                    This helps us improve performance and reliability.
                </p>

                <h4>D. Third-Party Cookies</h4>
                <p>
                    Some cookies may be placed by third-party services used for:
                </p>
                <ul>
                    <li>Analytics</li>
                    <li>Security monitoring</li>
                    <li>Performance optimization</li>
                </ul>

                <p>
                    Such cookies are governed by the respective third-party privacy and cookie policies.
                </p>

                <h4>3. Cookies We Do NOT Use</h4>
                <p>
                    E-Advocate Services does not use cookies for:
                </p>
                <ul>
                    <li>Targeted advertising</li>
                    <li>Behavioral tracking</li>
                    <li>Selling user data</li>
                    <li>Cross-site marketing</li>
                </ul>

                <p>
                    This aligns with ethical standards and professional norms applicable to legal
                    platforms and advocates regulated by the Bar Council of India.
                </p>

                <h4>4. How You Can Control Cookies</h4>
                <p>
                    You can manage or disable cookies through your browser settings:
                </p>
                <ul>
                    <li>Block all cookies</li>
                    <li>Delete existing cookies</li>
                    <li>Receive alerts when cookies are used</li>
                </ul>

                <p>
                    Please note: disabling essential cookies may affect website functionality.
                </p>

                <h4>5. Cookies on Mobile Applications</h4>
                <p>
                    Our mobile applications may use similar technologies (such as SDKs) for:
                </p>
                <ul>
                    <li>Security</li>
                    <li>Performance</li>
                    <li>Crash reporting</li>
                </ul>

                <p>
                    These are not used for advertising purposes.
                </p>

                <h4>6. Data Protection & Privacy</h4>
                <p>
                    Any information collected through cookies is handled in accordance with our
                    Privacy Policy and applicable Indian data protection laws.
                </p>

                <h4>7. Changes to This Policy</h4>
                <p>
                    We may update this Cookie Policy from time to time.
                    Any changes will be posted on this page with the updated date.
                    Continued use of the website after changes constitutes acceptance of the
                    updated policy.
                </p>
            </div>
        </section>
    );
};

export default CookiePolicy;
