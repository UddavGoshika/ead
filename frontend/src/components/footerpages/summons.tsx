import React from "react";
import styles from "./summons.module.css";

const SummonsNotices: React.FC = () => {
    return (
        <section className={styles.termsSection}>
            <div className={styles.termsContainer}>
                <div className={styles.container}>
                    <h4>Summons / Legal Notices</h4>

                    {/*
          <p className={styles.updated}>
            E-Advocate Services<br />
            Last updated: <strong>[Add Date]</strong>
          </p>
          */}

                    <p>
                        This page explains the official procedure for serving legal notices, summons,
                        or communications to E-Advocate Services and clarifies the platform’s role with
                        respect to legal proceedings involving users or advocates.
                    </p>

                    <hr />

                    <h4>1. Purpose of This Page</h4>
                    <p>
                        E-Advocate Services is a technology facilitation platform and not a law firm.
                    </p>

                    <p>
                        This page ensures transparency regarding:
                    </p>

                    <ul>
                        <li>Service of legal notices</li>
                        <li>Court summons</li>
                        <li>Regulatory communications</li>
                        <li>Government or law-enforcement requests</li>
                    </ul>

                    <h4>2. How to Serve Legal Notices to E-Advocate Services</h4>
                    <p>
                        All legal notices, summons, or official communications intended for
                        E-Advocate Services must be sent only through the official channels mentioned below.
                    </p>

                    <p><strong>Accepted Mode:</strong></p>

                    <ul>
                        <li>
                            📧 Official Email: <strong>[legal@yourdomain.com or support email]</strong>
                        </li>
                    </ul>

                    <p>
                        Notices sent through personal emails, WhatsApp, SMS, social media, or verbal
                        communication will not be considered valid service.
                    </p>

                    <h4>3. Notices Related to Advocates or Clients</h4>
                    <ul>
                        <li>E-Advocate Services is not a party to advocate–client disputes</li>
                        <li>
                            Legal notices intended for individual advocates or users must be addressed
                            directly to them
                        </li>
                        <li>We do not accept notices on behalf of advocates or clients</li>
                    </ul>

                    <p>
                        Professional responsibility remains solely with the concerned advocate,
                        in accordance with rules prescribed by the Bar Council of India.
                    </p>

                    <h4>4. Court Orders & Government Requests</h4>
                    <p>
                        We may comply with:
                    </p>

                    <ul>
                        <li>Court orders</li>
                        <li>Law-enforcement requests</li>
                        <li>Government or regulatory directions</li>
                    </ul>

                    <p>
                        Only when such requests are:
                    </p>

                    <ul>
                        <li>Issued by a competent authority</li>
                        <li>Properly served through lawful means</li>
                    </ul>

                    <p>
                        Any data disclosure will be limited strictly to what is legally required.
                    </p>

                    <h4>5. No Platform Liability for User Actions</h4>
                    <p>
                        E-Advocate Services shall not be liable for:
                    </p>

                    <ul>
                        <li>Legal advice provided by advocates</li>
                        <li>Acts or omissions of users</li>
                        <li>Case outcomes, filings, or court proceedings</li>
                        <li>
                            Failure of users to respond to notices served outside the platform
                        </li>
                    </ul>

                    <h4>6. Digital Communications Disclaimer</h4>
                    <ul>
                        <li>Platform notifications, emails, or messages are not legal notices</li>
                        <li>
                            In-app messages must not be treated as substitutes for court summons
                            or statutory notices
                        </li>
                        <li>
                            The platform does not guarantee delivery or acknowledgment of legal
                            communications between users
                        </li>
                    </ul>

                    <h4>7. False or Malicious Notices</h4>
                    <p>
                        Any attempt to:
                    </p>

                    <ul>
                        <li>Send fake legal notices</li>
                        <li>Impersonate courts, authorities, or advocates</li>
                        <li>Misuse the platform name for intimidation</li>
                    </ul>

                    <p>
                        May result in:
                    </p>

                    <ul>
                        <li>Account suspension</li>
                        <li>Reporting to law-enforcement authorities</li>
                        <li>Legal action under applicable Indian laws</li>
                    </ul>

                    <h4>8. Updates to This Policy</h4>
                    <p>
                        This page may be updated periodically to reflect changes in law or
                        platform operations. The latest version published on the website
                        shall prevail.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default SummonsNotices;
