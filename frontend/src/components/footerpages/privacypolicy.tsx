import React from "react";
import styles from "./privacypolicy.module.css";

const PrivacyPolicy: React.FC = () => {
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.policyCard}>
                <h4>Privacy Policy</h4>

                {/*
        <div className={styles.updatedDate}>
          E-Advocate Services<br />
          Last updated: <strong>[Add Date]</strong>
        </div>
        */}

                <p>
                    E-Advocate Services (“Platform”, “we”, “our”, “us”) is committed to protecting
                    the privacy and personal data of its users, including clients, advocates, and visitors.
                    This Privacy Policy explains how we collect, use, store, disclose, and protect your
                    information in compliance with applicable Indian laws and professional standards,
                    including guidelines issued by the Bar Council of India (BCI).
                </p>

                <p>
                    By accessing or using our website or mobile application, you agree to the terms
                    of this Privacy Policy.
                </p>

                <h4>1. Scope of This Policy</h4>
                <p>This policy applies to:</p>

                <ul>
                    <li>Website: E-Advocate Services</li>
                    <li>Mobile applications (Android / iOS)</li>
                    <li>All services, features, and communications provided through the platform</li>
                </ul>

                <p>
                    This policy does not provide legal advice and does not create an advocate-client
                    relationship by itself.
                </p>

                <h4>2. Information We Collect</h4>

                <h3>A. Information You Provide Voluntarily</h3>

                <p><strong>For Clients:</strong></p>
                <ul>
                    <li>Name</li>
                    <li>Mobile number</li>
                    <li>Email address</li>
                    <li>Location (city/state)</li>
                    <li>Case category/details (only what you choose to share)</li>
                </ul>

                <p><strong>For Advocates:</strong></p>
                <ul>
                    <li>Name</li>
                    <li>Mobile number & email</li>
                    <li>Bar Council enrollment number</li>
                    <li>Practice area(s)</li>
                    <li>Experience details</li>
                    <li>Office location</li>
                    <li>Verification documents (as required)</li>
                </ul>

                <div className={styles.note}>
                    ⚠️ We do not publish sensitive personal information publicly without explicit user consent.
                </div>

                <h4>B. Automatically Collected Information</h4>
                <ul>
                    <li>IP address</li>
                    <li>Device information</li>
                    <li>Browser/app usage data</li>
                    <li>Log files and timestamps</li>
                </ul>

                <p><strong>Used strictly for:</strong></p>
                <ul>
                    <li>Security</li>
                    <li>Performance improvement</li>
                    <li>Fraud prevention</li>
                </ul>

                <h4>3. Purpose of Data Collection</h4>
                <ul>
                    <li>User registration & verification</li>
                    <li>Connecting clients with advocates</li>
                    <li>Platform communication (notifications, updates)</li>
                    <li>Compliance with legal and regulatory requirements</li>
                    <li>Preventing misuse or fraud</li>
                </ul>

                <p>We do not sell, rent, or trade user data.</p>

                <h4>4. Advocate–Client Confidentiality</h4>
                <ul>
                    <li>All communications between advocates and clients are private</li>
                    <li>We do not read, monitor, or interfere with legal communications</li>
                    <li>Professional confidentiality remains the responsibility of the advocate</li>
                </ul>

                <h4>5. Data Sharing & Disclosure</h4>
                <p>We may share information only when legally required, including:</p>
                <ul>
                    <li>Court orders</li>
                    <li>Government or law-enforcement requests</li>
                    <li>Regulatory compliance</li>
                </ul>

                <p>We never share data for advertising or commercial resale.</p>

                <h4>6. Data Storage & Security</h4>
                <ul>
                    <li>Secure servers</li>
                    <li>Encrypted data transmission</li>
                    <li>Access control mechanisms</li>
                    <li>Regular security audits</li>
                </ul>

                <p>
                    While we take strong precautions, no digital platform can guarantee 100% security.
                    Users should protect their login credentials.
                </p>

                <h4>7. Cookies & Tracking</h4>
                <p>
                    We may use cookies to improve user experience, analyze traffic, and maintain session integrity.
                    Users can control cookies through browser settings.
                </p>

                <h4>8. User Rights</h4>
                <ul>
                    <li>Access your personal data</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion (subject to legal obligations)</li>
                    <li>Withdraw consent where applicable</li>
                </ul>

                <div className={styles.contact}>
                    Requests can be sent to:<br />
                    📧 <strong>support@tatitoprojects.com

                    </strong>
                </div>

                <h4>9. Third-Party Links</h4>
                <p>
                    Our platform may contain links to third-party websites. We are not responsible
                    for their privacy practices or content.
                </p>

                <h4>10. Children’s Privacy</h4>
                <p>
                    Our services are not intended for users under 18 years of age.
                    We do not knowingly collect data from minors.
                </p>

                <h4>11. Compliance with Indian Laws</h4>
                <ul>
                    <li>Information Technology Act, 2000</li>
                    <li>IT Rules, 2011</li>
                    <li>Applicable data protection principles in India</li>
                    <li>Professional conduct standards for advocates</li>
                </ul>

                <h4>12. Policy Updates</h4>
                <p>
                    We may update this Privacy Policy periodically. Updates will be posted on this page
                    with the revised date. Continued use of the platform indicates acceptance.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
